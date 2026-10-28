/**
 * Intelligence scores from the public Artificial Analysis leaderboard.
 *
 * https://artificialanalysis.ai/leaderboards/models is server-rendered HTML
 * (no JSON API without a key), so one request per refresh yields the whole
 * table: model name, creator, Intelligence Index score, cost per task, speed.
 */

export const LEADERBOARD_URL = 'https://artificialanalysis.ai/leaderboards/models'

/** Peers compared on the 变祖器; `match` selects the row family on the leaderboard. */
export const DEFAULT_SCORE_PEERS = [
  { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V4 Pro', vendor: 'DeepSeek', deepseek: true, match: /^deepseek v4 pro\b/i },
  { id: 'deepseek/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash', vendor: 'DeepSeek', deepseek: true, match: /^deepseek v4\.1 flash\b/i },
  { id: 'openai/gpt-6.1-terra-pro', label: 'GPT-6.1 Terra Pro', vendor: 'OpenAI', match: /^gpt-6\.1 terra( pro)?\b/i },
  { id: 'anthropic/claude-opus-5.5', label: 'Claude Opus 5.5', vendor: 'Anthropic', match: /^claude opus 5\.5\b/i },
  { id: 'google/gemini-4-argon', label: 'Gemini 4 Argon', vendor: 'Google', match: /^gemini 4 argon\b/i },
  { id: 'x-ai/grok-4.7', label: 'Grok 4.7', vendor: 'xAI', match: /^grok 4\.7\b/i },
  { id: 'qwen/qwen3.8-max-prime', label: 'Qwen3.8 Max Prime', vendor: 'Qwen', match: /^qwen3\.8 max\b/i },
  { id: 'z-ai/glm-5.3-prime', label: 'GLM 5.3 Prime', vendor: 'Z.ai', match: /^glm-?5\.3\b/i },
  { id: 'moonshotai/kimi-k3.1-pro', label: 'Kimi K3.1 Pro', vendor: 'Moonshot', match: /^kimi k3\.1 pro\b/i },
  { id: 'minimax/minimax-m3', label: 'MiniMax M3', vendor: 'MiniMax', match: /^minimax[- ]m3(?!\.)/i },
]

/** Strip tags/entities and collapse whitespace. */
function text(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Parse every data row of the leaderboard table. */
export function parseLeaderboardHtml(html) {
  if (typeof html !== 'string' || html.length < 5000) {
    throw new Error('leaderboard returned an unexpectedly short document')
  }
  const rows = []
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/g
  let rowMatch
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const cells = []
    const cellRe = /<td\b[^>]*>([\s\S]*?)<\/td>/g
    let cellMatch
    while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) cells.push(text(cellMatch[1]))
    if (cells.length < 5) continue
    const name = cells[0]
    if (!name || /^model$/i.test(name)) continue
    const context = cells[1]
    const creator = cells[2]
    const score = Number.parseFloat(cells[3])
    if (!Number.isFinite(score)) continue
    const cost = Number.parseFloat(String(cells[4] || '').replace(/[$,]/g, ''))
    const speed = Number.parseFloat(cells[5])
    rows.push({
      name,
      creator,
      context,
      score,
      costPerTaskUsd: Number.isFinite(cost) ? cost : null,
      outputTokensPerSecond: Number.isFinite(speed) ? speed : null,
    })
  }
  if (rows.length < 10) throw new Error('leaderboard table was not recognized (' + rows.length + ' rows)')
  return rows
}

/** Resolve the configured peers to their best (highest) leaderboard variant. */
export function pickPeerScores(rows, peers = DEFAULT_SCORE_PEERS) {
  const picked = []
  for (const peer of peers) {
    const candidates = rows.filter(row => peer.match.test(row.name))
    if (candidates.length === 0) continue
    const best = candidates.reduce((a, b) => (b.score > a.score ? b : a))
    picked.push({
      id: peer.id,
      label: peer.label,
      vendor: peer.vendor,
      deepseek: Boolean(peer.deepseek),
      matchedName: best.name,
      score: best.score,
      costPerTaskUsd: best.costPerTaskUsd,
    })
  }
  return picked
}

/** Fetch the live leaderboard, score the peers and compute the percentile base. */
export async function fetchBenchmarks({ peers = DEFAULT_SCORE_PEERS, timeoutMs = 15_000, fetchImpl = globalThis.fetch } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(LEADERBOARD_URL, {
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'dsh-auto-lwf-sr/1.0 (+intelligence monitor)',
      },
    })
    if (!response.ok) throw new Error('Artificial Analysis answered HTTP ' + response.status)
    const rows = parseLeaderboardHtml(await response.text())
    const models = pickPeerScores(rows, peers).map(model => ({
      ...model,
      percentile: rows.filter(row => row.score < model.score).length / rows.length,
    }))
    if (!models.some(model => model.deepseek)) {
      throw new Error('no DeepSeek model was found on the leaderboard')
    }
    const scores = rows.map(row => row.score).sort((a, b) => a - b)
    const frontier = scores[scores.length - 1]
    return {
      models,
      frontier,
      median: scores[Math.floor(scores.length / 2)],
      universeSize: scores.length,
      source: LEADERBOARD_URL,
      fetchedAt: Date.now(),
    }
  } finally {
    clearTimeout(timer)
  }
}
