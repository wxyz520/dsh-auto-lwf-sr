/**
 * The 变祖器 scoring model.
 *
 * A composite 0..100 score built from three independent, live measurements:
 *   stability (40%)  DeepSeek status page: 90-day uptime, current incidents
 *   quality   (35%)  Artificial Analysis Intelligence Index percentile
 *   price     (25%)  blended USD / 1M tokens vs the peer-suite median
 *
 * Score maps onto the six meme tiers, from 小难梁 to 梁祖.
 */

export const TIERS = [
  { id: 'xiaonanliang', name: '小难梁', min: 0, tagline: '勉强能跑，别问好不好用' },
  { id: 'laoliang', name: '牢梁', min: 18, tagline: '能用，但也只限于能用' },
  { id: 'liangzi', name: '梁子', min: 34, tagline: '稳中有升，值得处' },
  { id: 'liangsheng', name: '梁圣', min: 50, tagline: '业界标杆，圣光普照' },
  { id: 'liangshen', name: '梁神', min: 66, tagline: '发挥稳定，封神在望' },
  { id: 'liangzu', name: '梁祖', min: 82, tagline: '万祖归一，祖上显灵' },
]

export const DEFAULT_WEIGHTS = { stability: 0.5, quality: 0.3, price: 0.2 }

/**
 * Current service state caps the final score: a degraded or down service cannot
 * keep the slider in a top tier no matter how cheap the tokens are. This is the
 * "分级" contract between the live status grade and the six meme tiers.
 */
export const STATUS_CAPS = {
  operational: 100,
  maintenance: 81.9,   // 梁神
  degraded: 49.9,      // 梁子：异常就不该还停在梁神
  partial_outage: 33.9, // 牢梁：部分中断
  full_outage: 8,      // 小难梁：全面中断
}

const clamp01 = value => Math.min(1, Math.max(0, value))
const round = (value, digits = 1) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function tierFor(score) {
  let index = 0
  for (let i = 0; i < TIERS.length; i++) {
    if (score >= TIERS[i].min) index = i
  }
  return index
}

export function nextTierFor(score) {
  const index = tierFor(score)
  if (index >= TIERS.length - 1) return null
  const next = TIERS[index + 1]
  return { index: index + 1, name: next.name, gap: round(Math.max(0, next.min - score), 1) }
}

const OVERALL_CAP = {
  operational: 1,
  maintenance: 0.9,
  degraded: 0.7,
  partial_outage: 0.4,
  full_outage: 0,
}

export function stabilityFactor(status) {
  if (!status) {
    return {
      value: 0.5,
      level: 'unknown',
      letter: '?',
      gradeValue: 0.5,
      uptime: null,
      uptimeApi: null,
      incidents: 0,
      components: [],
      degraded: true,
    }
  }
  const level = String(status.overall || 'operational')
  const grade = status.grade || { level, letter: '?', value: level === 'operational' ? 1 : 0.5 }
  const gradeValue = Number.isFinite(grade.value) ? clamp01(grade.value) : 0.5
  const uptime = Number.isFinite(status.uptime24h) ? status.uptime24h : (Number.isFinite(status.uptime) ? status.uptime : null)
  const uptimeFactor = uptime === null ? 0.5 : clamp01((uptime - 98.5) / 1.5)
  return {
    value: clamp01(0.8 * gradeValue + 0.2 * uptimeFactor),
    level: String(grade.level || level),
    letter: String(grade.letter || '?'),
    gradeValue,
    uptime: uptime === null ? null : round(uptime, 3),
    uptimeApi: Number.isFinite(status.uptimeApi) ? round(status.uptimeApi, 3) : (uptime === null ? null : round(uptime, 3)),
    incidents: Array.isArray(status.activeIncidents) ? status.activeIncidents.length : 0,
    components: Array.isArray(status.components)
      ? status.components.map(item => ({
          name: String(item.name || ''),
          status: String(item.status || 'operational'),
          uptime: Number.isFinite(item.uptime) ? round(item.uptime, 3) : null,
        }))
      : [],
    degraded: false,
  }
}

export function qualityFactor(benchmarks) {
  if (!benchmarks || !Array.isArray(benchmarks.models)) {
    return { value: 0.5, score: null, frontier: null, percentile: null, model: null, degraded: true }
  }
  const owned = benchmarks.models.filter(model => model.deepseek)
  const pool = owned.length > 0 ? owned : benchmarks.models
  const best = pool.reduce((a, b) => (b.score > a.score ? b : a))
  const percentile = Number.isFinite(best.percentile)
    ? clamp01(best.percentile)
    : Number.isFinite(benchmarks.frontier) && benchmarks.frontier > 0
      ? clamp01(best.score / benchmarks.frontier)
      : 0.5
  return {
    value: percentile,
    score: best.score,
    frontier: benchmarks.frontier ?? null,
    percentile: round(percentile, 3),
    model: best.label,
    degraded: false,
  }
}

export function priceFactor(pricing) {
  const composite = pricing && pricing.composite && Number.isFinite(pricing.composite.blendedPerMillion)
    ? pricing.composite.blendedPerMillion
    : (pricing && pricing.deepseek && Number.isFinite(pricing.deepseek.blendedPerMillion) ? pricing.deepseek.blendedPerMillion : null)
  const baseline = pricing && Number.isFinite(pricing.peerMedian) ? pricing.peerMedian : null
  if (composite === null || baseline === null || composite <= 0) {
    return {
      value: 0.5,
      compositeUsd: null,
      deepseekUsd: null,
      peerMedianUsd: null,
      ratio: null,
      percentile: null,
      parts: [],
      degraded: true,
    }
  }
  // Log scale: matching the peer median scores 0, being 10x cheaper scores 1.
  const ratio = baseline / composite
  const value = clamp01(Math.log10(ratio))
  return {
    value,
    compositeUsd: round(composite, 3),
    deepseekUsd: pricing.deepseek && Number.isFinite(pricing.deepseek.blendedPerMillion) ? round(pricing.deepseek.blendedPerMillion, 3) : null,
    peerMedianUsd: round(baseline, 3),
    ratio: round(ratio, 2),
    percentile: round(value, 3),
    parts: (pricing.composite && Array.isArray(pricing.composite.parts)) ? pricing.composite.parts : [],
    degraded: false,
  }
}

const GENERIC_SOURCE = 'https://status.deepseek.com/'

function sourceInfo(source, extra = {}) {
  if (!source) return { ok: false, fetchedAt: null, ...extra }
  return { ok: true, fetchedAt: source.fetchedAt ?? null, ...extra }
}

/**
 * Compose one snapshot for the client. `history` is carried through as-is.
 */
export function computeSnapshot({ status, benchmarks, pricing, history = [], errors = [], now = Date.now() }, weights = DEFAULT_WEIGHTS) {
  const stability = stabilityFactor(status)
  const quality = qualityFactor(benchmarks)
  const price = priceFactor(pricing)
  const total = 100 * (
    (weights.stability * stability.value) +
    (weights.quality * quality.value) +
    (weights.price * price.value)
  )
  const rawScore = round(Math.min(100, Math.max(0, total)), 1)
  const cap = Number.isFinite(STATUS_CAPS[stability.level]) ? STATUS_CAPS[stability.level] : 100
  const score = round(Math.min(cap, rawScore), 1)
  const tierIndex = tierFor(score)
  const points = {
    stability: round(100 * weights.stability * stability.value, 1),
    quality: round(100 * weights.quality * quality.value, 1),
    price: round(100 * weights.price * price.value, 1),
  }
  const point = { time: now, score, tierIndex }
  const nextHistory = [...history, point].slice(-120)
  return {
    score,
    rawScore,
    cap,
    tierIndex,
    tier: { ...TIERS[tierIndex], index: tierIndex },
    nextTier: nextTierFor(score),
    points,
    factors: { stability, quality, price },
    sources: {
      status: sourceInfo(status && { fetchedAt: status.fetchedAt }, { uptime: stability.uptime, overall: stability.level, grade: stability.letter }),
      benchmarks: sourceInfo(benchmarks && { fetchedAt: benchmarks.fetchedAt }, { frontier: quality.frontier, universeSize: benchmarks?.universeSize ?? null }),
      pricing: sourceInfo(pricing, { model: quality.model }),
    },
    history: nextHistory,
    updatedAt: now,
    degraded: stability.degraded || quality.degraded || price.degraded,
    errors: errors.slice(-6),
    modelTable: (benchmarks?.models || []).map(model => ({
      label: model.label,
      vendor: model.vendor,
      score: model.score,
      deepseek: Boolean(model.deepseek),
      matchedName: model.matchedName || null,
    })),
    priceTable: (pricing?.rows || []).map(row => ({
      label: row.label,
      vendor: row.vendor,
      blendedPerMillion: row.blendedPerMillion,
      deepseek: Boolean(row.deepseek),
      openrouterId: row.id || null,
    })),
    sourceUrls: {
      status: status?.source || GENERIC_SOURCE,
      benchmarks: benchmarks?.source || 'https://artificialanalysis.ai/leaderboards/models',
      pricing: pricing?.source || 'https://openrouter.ai/api/v1/models',
    },
  }
}
