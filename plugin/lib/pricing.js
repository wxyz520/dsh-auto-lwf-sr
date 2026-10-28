/**
 * Live price-per-million-token comparison from the public OpenRouter model catalogue.
 * https://openrouter.ai/api/v1/models needs no credential and returns per-token
 * price strings for every listed model.
 */

export const PRICING_URL = 'https://openrouter.ai/api/v1/models'

/** Models the 变祖器 compares against. DeepSeek rows are the subject of the score. */
export const DEFAULT_PEERS = [
  { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V4 Pro', vendor: 'DeepSeek', deepseek: true, mainstream: true },
  { id: 'deepseek/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash', vendor: 'DeepSeek', deepseek: true, mainstream: true },
  { id: 'deepseek/deepseek-v4.1-flash-1017', label: 'DeepSeek V4.1 Flash 1017', vendor: 'DeepSeek', deepseek: true },
  { id: 'openai/gpt-6.1-terra-pro', label: 'GPT-6.1 Terra Pro', vendor: 'OpenAI' },
  { id: 'anthropic/claude-opus-5.5', label: 'Claude Opus 5.5', vendor: 'Anthropic' },
  { id: 'google/gemini-4-argon', label: 'Gemini 4 Argon', vendor: 'Google' },
  { id: 'x-ai/grok-4.7', label: 'Grok 4.7', vendor: 'xAI' },
  { id: 'qwen/qwen3.8-max-prime', label: 'Qwen3.8 Max Prime', vendor: 'Qwen' },
  { id: 'z-ai/glm-5.3-prime', label: 'GLM 5.3 Prime', vendor: 'Z.ai' },
  { id: 'moonshotai/kimi-k3.1-pro', label: 'Kimi K3.1 Pro', vendor: 'Moonshot' },
  { id: 'minimax/minimax-m3', label: 'MiniMax M3', vendor: 'MiniMax' },
]

const round = (value, digits = 3) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Blended USD per 1M tokens using the conventional 3:1 prompt:completion ratio. */
export function blendedPerMillion(promptPrice, completionPrice) {
  if (!Number.isFinite(promptPrice) || !Number.isFinite(completionPrice)) return null
  return round(((promptPrice * 3 + completionPrice) / 4) * 1_000_000)
}

function findModel(models, id) {
  const candidates = models.filter(model => {
    const key = String(model?.id || '')
    if (!key || key.startsWith('~') || key.includes(':batch') || key.includes(':free')) return false
    return key === id
  })
  if (candidates.length > 0) return candidates[0]
  const prefixed = models.filter(model => {
    const key = String(model?.id || '')
    if (!key || key.startsWith('~') || key.includes(':batch') || key.includes(':free')) return false
    return key.startsWith(id + '-')
  })
  if (prefixed.length > 0) return prefixed[0]
  return models.find(model => String(model?.id || '') === id)
}

/** Turn the OpenRouter catalogue into the comparison rows this plugin needs. */
export function buildPricingRows(catalogue, peers = DEFAULT_PEERS) {
  const models = Array.isArray(catalogue) ? catalogue : []
  const rows = []
  for (const peer of peers) {
    const model = findModel(models, peer.id)
    if (!model) continue
    const pricing = model.pricing || {}
    const prompt = Number(pricing.prompt)
    const completion = Number(pricing.completion)
    const blended = blendedPerMillion(prompt, completion)
    if (blended === null || blended <= 0) continue
    rows.push({
      id: String(model.id),
      label: peer.label,
      vendor: peer.vendor,
      deepseek: Boolean(peer.deepseek),
      mainstream: Boolean(peer.mainstream),
      promptPerMillion: round(prompt * 1_000_000),
      completionPerMillion: round(completion * 1_000_000),
      blendedPerMillion: blended,
    })
  }
  const deepseekRows = rows.filter(row => row.deepseek)
  const reference = deepseekRows.find(row => /v4-pro/i.test(row.label)) || deepseekRows[0]
  const others = rows.filter(row => !row.deepseek).map(row => row.blendedPerMillion).sort((a, b) => a - b)
  const median = others.length === 0
    ? null
    : others.length % 2 === 1
      ? others[(others.length - 1) / 2]
      : round((others[others.length / 2 - 1] + others[others.length / 2]) / 2)

  // 综合主流价: geometric mean of DeepSeek's mainstream models (Pro + Flash).
  // Dated snapshots such as `V4.1 Flash 1017` stay in the table but not in the
  // index, so one family cannot be counted twice.
  const mainstream = deepseekRows.filter(row => row.mainstream)
  const parts = (mainstream.length > 0 ? mainstream : deepseekRows).map(row => ({
    label: row.label,
    blendedPerMillion: row.blendedPerMillion,
  }))
  const composite = parts.length > 0
    ? round(Math.exp(parts.reduce((sum, part) => sum + Math.log(part.blendedPerMillion), 0) / parts.length), 3)
    : null

  return {
    rows,
    deepseek: reference || null,
    composite: composite === null ? null : { blendedPerMillion: composite, parts },
    peerMedian: median,
    peerMin: others.length > 0 ? others[0] : null,
    source: PRICING_URL,
  }
}

/** Fetch the live OpenRouter catalogue and build the comparison rows. */
export async function fetchPricing({ peers = DEFAULT_PEERS, timeoutMs = 12_000, fetchImpl = globalThis.fetch } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(PRICING_URL, {
      signal: controller.signal,
      headers: { accept: 'application/json', 'user-agent': 'dsh-auto-lwf-sr/1.0' },
    })
    if (!response.ok) throw new Error('OpenRouter answered HTTP ' + response.status)
    const payload = await response.json()
    const rows = buildPricingRows(payload && payload.data, peers)
    if (!rows.deepseek) throw new Error('DeepSeek model was not found in the OpenRouter catalogue')
    return { ...rows, fetchedAt: Date.now() }
  } finally {
    clearTimeout(timer)
  }
}
