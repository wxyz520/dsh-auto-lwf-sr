/**
 * DeepSeek status reader.
 *
 * Primary source: the FlashCat status-page JSON the page itself calls.
 *   GET /api/status-page/<pageId>/summary/active                → page config + active incidents
 *   GET /api/status-page/<pageId>/summary/structure?start_at_…  → rolling uptime per component
 *
 * Fallback: the server-rendered status page HTML (React flight payload), used
 * when the JSON routes change or the page id stops resolving.
 *
 * The stability input is the *current* service state: per-component statuses
 * derived from active incidents, graded operational → full outage. Rolling
 * 24h uptime is a secondary nudge so an incident keeps weighing after it
 * resolves.
 */

export const STATUS_URL = 'https://status.deepseek.com/'
export const PAGE_ID = '6410630422455'
export const ACTIVE_URL = `${STATUS_URL}api/status-page/${PAGE_ID}/summary/active`
export const STRUCTURE_URL = `${STATUS_URL}api/status-page/${PAGE_ID}/summary/structure`
export const ROLLING_WINDOW_SECONDS = 24 * 60 * 60

/** Service states, worst last. */
export const STATUS_ORDER = ['operational', 'maintenance', 'degraded', 'partial_outage', 'full_outage']

/** Grade for the current service state, shown as S/A/C/D/E in the UI. */
export const STATUS_GRADES = {
  operational: { letter: 'S', value: 1 },
  maintenance: { letter: 'A', value: 0.8 },
  degraded: { letter: 'C', value: 0.25 },
  partial_outage: { letter: 'D', value: 0.05 },
  full_outage: { letter: 'E', value: 0 },
}

const worstStatus = list => list.reduce(
  (worst, status) => (STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(worst) ? status : worst),
  'operational',
)

function unescapeFlightString(raw) {
  try {
    return JSON.parse('"' + raw + '"')
  } catch {
    return raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n')
  }
}

/** Concatenate every React flight payload chunk found in the served HTML. */
export function extractFlight(html) {
  const out = []
  const re = /self\.__next_f\.push\(\[1,((?:"(?:[^"\\]|\\.)*")|[^\]]*)\]\)/g
  let m
  while ((m = re.exec(html)) !== null) {
    const token = m[1].trim()
    if (token.startsWith('"')) out.push(unescapeFlightString(token.slice(1, -1)))
  }
  return out.join('')
}

/** Parse one JSON value that starts at `index` and runs to its matching bracket. */
export function sliceJsonValue(text, index) {
  const open = text[index]
  if (open !== '[' && open !== '{') return undefined
  const close = open === '[' ? ']' : '}'
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = index; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(index, i + 1))
        } catch {
          return undefined
        }
      }
    }
  }
  return undefined
}

/** Find the first array value of `"key"` in a flight payload. */
export function findJsonArray(text, key, { from = 0 } = {}) {
  const needle = '"' + key + '":'
  let at = text.indexOf(needle, from)
  while (at !== -1) {
    let i = at + needle.length
    while (i < text.length && /\s/.test(text[i])) i++
    if (text[i] === '[') {
      const value = sliceJsonValue(text, i)
      if (Array.isArray(value)) return value
    }
    at = text.indexOf(needle, at + needle.length)
  }
  return undefined
}

/** Shared finishing step: grade, averages, timestamps. */
function finishStatus({ overall, components, activeIncidents, uptime24h, now, source }) {
  const grade = STATUS_GRADES[overall] || STATUS_GRADES.operational
  const apiRows = components.filter(row => /API\s*服务|API Service/i.test(row.name) && Number.isFinite(row.uptime))
  const rolling = Number.isFinite(uptime24h) ? uptime24h : null
  return {
    overall,
    grade: { level: overall, letter: grade.letter, value: grade.value },
    uptime24h: rolling,
    uptime: rolling,
    uptimeApi: apiRows.length > 0 ? apiRows.reduce((sum, row) => sum + row.uptime, 0) / apiRows.length : rolling,
    components,
    activeIncidents,
    degraded: false,
    updatedAt: null,
    fetchedAt: now,
    source,
  }
}

/** Build one status snapshot from the JSON API responses. */
export function buildStatusFromApi({ summary, structure, now = Date.now() }) {
  const data = summary && summary.data
  if (!data || !data.page) throw new Error('status summary payload has no page data')
  const page = data.page
  const active = Array.isArray(data.active_changes) ? data.active_changes : []
  const structureData = (structure && structure.data) || {}
  const rolling = new Map()
  for (const item of structureData.component_uptimes || []) {
    if (item && typeof item.component_id === 'string' && Number.isFinite(item.uptime)) {
      rolling.set(item.component_id, item.uptime)
    }
  }

  const statusById = new Map()
  const activeIncidents = []
  for (const change of active) {
    const changeStatus = STATUS_ORDER.includes(change.status) ? change.status : 'degraded'
    const affected = Array.isArray(change.affected_components) ? change.affected_components : []
    const changed = []
    for (const item of affected) {
      if (!item || typeof item.component_id !== 'string') continue
      const componentStatus = STATUS_ORDER.includes(item.status) ? item.status : changeStatus
      const previous = statusById.get(item.component_id)
      statusById.set(item.component_id, previous ? worstStatus([previous, componentStatus]) : componentStatus)
      changed.push({ id: item.component_id, name: String(item.name || ''), status: componentStatus })
    }
    activeIncidents.push({
      title: String(change.title || ''),
      status: changeStatus,
      startedAt: Number(change.start_at_seconds || 0) * 1000,
      type: String(change.type || 'incident'),
      components: changed,
    })
  }

  const components = (page.components || []).map(item => ({
    id: item.component_id,
    name: String(item.name || item.component_id),
    section: String(item.section_id || ''),
    uptime: rolling.has(item.component_id) ? rolling.get(item.component_id) : null,
    status: statusById.get(item.component_id) || 'operational',
  }))
  const rated = components.filter(item => Number.isFinite(item.uptime))
  const uptime24h = rated.length > 0 ? rated.reduce((sum, item) => sum + item.uptime, 0) / rated.length : null

  return finishStatus({
    overall: worstStatus(components.map(item => item.status)),
    components,
    activeIncidents,
    uptime24h,
    now,
    source: ACTIVE_URL,
  })
}

/** Legacy fallback: parse the server-rendered status page HTML. */
export function parseStatusHtml(html, { now = Date.now() } = {}) {
  if (typeof html !== 'string' || html.length < 1000) {
    throw new Error('status page returned an unexpectedly short document')
  }
  const flight = extractFlight(html)
  if (!flight) throw new Error('status page payload (React flight data) was not found')

  const components = findJsonArray(flight, 'components') || []
  const sections = findJsonArray(flight, 'sections') || []
  const uptimes = findJsonArray(flight, 'component_uptimes') || []
  const activeChanges = findJsonArray(flight, 'active_changes') || []

  const names = new Map()
  for (const item of [...components, ...sections]) {
    if (item && typeof item.component_id === 'string') names.set(item.component_id, String(item.name || item.component_id))
    if (item && typeof item.section_id === 'string' && item.name) names.set(item.section_id, String(item.name))
  }
  const uptimeById = new Map()
  for (const item of uptimes) {
    if (item && typeof item.component_id === 'string' && Number.isFinite(item.uptime)) {
      uptimeById.set(item.component_id, item.uptime)
    }
  }
  const statusById = new Map()
  for (const change of activeChanges) {
    const affected = Array.isArray(change?.affected_components) ? change.affected_components : []
    for (const item of affected) {
      if (!item || typeof item.component_id !== 'string') continue
      statusById.set(item.component_id, String(item.status || change.status || 'degraded'))
    }
  }

  const rows = []
  for (const item of components) {
    if (!item || typeof item.component_id !== 'string') continue
    const uptime = uptimeById.get(item.component_id)
    if (!Number.isFinite(uptime)) continue
    rows.push({
      id: item.component_id,
      name: String(item.name || names.get(item.component_id) || item.component_id),
      section: String(item.section_id || ''),
      uptime,
      status: statusById.get(item.component_id) || 'operational',
    })
  }

  const apiRows = rows.filter(row => /API\s*服务|API Service/i.test(row.name))
  const relevant = apiRows.length > 0 ? apiRows : rows
  const uptime = relevant.length > 0 ? relevant.reduce((sum, row) => sum + row.uptime, 0) / relevant.length : null

  return finishStatus({
    overall: worstStatus(rows.map(row => row.status)),
    components: rows,
    activeIncidents: activeChanges.map(change => ({
      title: String(change?.title || ''),
      status: String(change?.status || ''),
      startedAt: Number(change?.start_at_seconds || 0) * 1000,
      type: String(change?.type || ''),
      components: [],
    })),
    uptime24h: uptime,
    now,
    source: STATUS_URL,
  })
}

async function request(url, { timeoutMs, fetchImpl, accept }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        accept,
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'user-agent': 'dsh-auto-lwf-sr/1.2 (+status monitor)',
      },
    })
    if (!response.ok) throw new Error('status endpoint answered HTTP ' + response.status + ' for ' + url)
    return response
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch the live status: JSON API first, HTML fallback second.
 */
export async function fetchStatus({ timeoutMs = 10_000, fetchImpl = globalThis.fetch } = {}) {
  const now = Date.now()
  const from = Math.floor((now - ROLLING_WINDOW_SECONDS * 1000) / 1000)
  const to = Math.floor(now / 1000)
  const jsonTimeout = Math.max(3_000, Math.min(timeoutMs, 10_000))
  try {
    const [summaryResponse, structureResponse] = await Promise.all([
      request(ACTIVE_URL, { timeoutMs: jsonTimeout, fetchImpl, accept: 'application/json' }),
      request(STRUCTURE_URL + `?start_at_from_seconds=${from}&start_at_to_seconds=${to}`, {
        timeoutMs: jsonTimeout,
        fetchImpl,
        accept: 'application/json',
      }),
    ])
    const [summary, structure] = await Promise.all([summaryResponse.json(), structureResponse.json()])
    return buildStatusFromApi({ summary, structure, now })
  } catch (apiError) {
    try {
      const response = await request(STATUS_URL, { timeoutMs, fetchImpl, accept: 'text/html,application/xhtml+xml' })
      return parseStatusHtml(await response.text(), { now })
    } catch (htmlError) {
      throw new Error(
        'status API failed (' + String(apiError?.message || apiError) + ') and HTML fallback failed (' + String(htmlError?.message || htmlError) + ')',
      )
    }
  }
}
