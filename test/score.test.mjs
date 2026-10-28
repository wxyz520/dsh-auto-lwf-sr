/**
 * Unit checks for the status-graded stability factor and the tier caps.
 * Run with: node test/score.test.mjs
 */
import assert from 'node:assert/strict'
import { computeSnapshot, STATUS_CAPS, tierFor, stabilityFactor } from '../plugin/lib/score.js'

const benchmarks = {
  models: [
    { label: 'DeepSeek V4.1 Flash', vendor: 'DeepSeek', score: 32, deepseek: true, matchedName: 'DeepSeek V4.1 Flash 1017 (max)', percentile: 0.5 },
  ],
  frontier: 58,
  fetchedAt: Date.now(),
}
const peers = [4, 6, 8].map((price, index) => ({ label: 'peer' + index, blendedPerMillion: price, deepseek: false }))
const pricing = {
  deepseek: { blendedPerMillion: 1.194, label: 'DeepSeek V4 Pro' },
  peerMedian: 6,
  rows: [{ label: 'DeepSeek V4 Pro', blendedPerMillion: 1.194, deepseek: true }, ...peers],
  fetchedAt: Date.now(),
}

const levelValue = { operational: 1, maintenance: 0.85, degraded: 0.5, partial_outage: 0.2, full_outage: 0 }
const levelLetter = { operational: 'S', maintenance: 'A', degraded: 'C', partial_outage: 'D', full_outage: 'E' }
function statusFor(level, uptime = 100) {
  return {
    overall: level,
    grade: { level, letter: levelLetter[level], value: levelValue[level] },
    uptime24h: uptime,
    activeIncidents: level === 'operational' ? [] : [{ title: 'incident', status: level, startedAt: Date.now(), components: [] }],
    components: [],
    fetchedAt: Date.now(),
  }
}

// operational + clean uptime = full stability points
const healthy = computeSnapshot({ status: statusFor('operational'), benchmarks, pricing })
assert.equal(healthy.factors.stability.value, 1)
assert.equal(healthy.factors.stability.letter, 'S')
assert.equal(healthy.cap, STATUS_CAPS.operational)

// every non-operational state caps the slider at or below its grade ceiling
for (const level of ['maintenance', 'degraded', 'partial_outage', 'full_outage']) {
  const snapshot = computeSnapshot({ status: statusFor(level), benchmarks, pricing })
  assert.equal(snapshot.cap, STATUS_CAPS[level], level + ' cap')
  assert.ok(snapshot.score <= STATUS_CAPS[level], level + ' score under cap')
  assert.ok(snapshot.rawScore >= snapshot.score, level + ' raw score kept')
}
assert.equal(computeSnapshot({ status: statusFor('degraded'), benchmarks, pricing }).tierIndex, 2, 'degraded tops out at 梁子')
assert.equal(computeSnapshot({ status: statusFor('partial_outage'), benchmarks, pricing }).tierIndex, 1, 'partial outage drops to 牢梁')
assert.equal(computeSnapshot({ status: statusFor('full_outage'), benchmarks, pricing }).tierIndex, 0, 'full outage drops to 小难梁')

// rolling uptime nudges stability while the status stays operational
const dropped = computeSnapshot({ status: statusFor('operational', 99.0), benchmarks, pricing })
assert.ok(dropped.factors.stability.value < 1 && dropped.factors.stability.value > 0.7, 'uptime reduces stability')
assert.equal(dropped.factors.stability.level, 'operational')

// a completely missing status degrades gracefully instead of throwing
const unknown = stabilityFactor(null)
assert.equal(unknown.degraded, true)
assert.ok(unknown.value > 0 && unknown.value <= 0.6)

// tier thresholds stay ordered
for (const [score, tier] of [[0, 0], [17.9, 0], [18, 1], [34, 2], [50, 3], [66, 4], [82, 5], [100, 5]]) {
  assert.equal(tierFor(score), tier, 'tier for ' + score)
}

console.log('score checks: PASS', 'healthy=' + healthy.score, 'degraded=' + computeSnapshot({ status: statusFor('degraded'), benchmarks, pricing }).score)
