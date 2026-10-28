/**
 * 自动变祖器 · Host half.
 *
 * Two cadences keep the score live:
 *   - status sampler (every ~20s): DeepSeek status API → current component
 *     states, graded S/A/C/D/E, plus rolling 24h uptime. Fast and small.
 *   - catalog sampler (every 10min): Artificial Analysis scores + OpenRouter
 *     prices.
 *
 * Every status sample recomputes the ancestor score against the cached
 * catalog, so an incident or recovery moves the slider within seconds. The Web
 * UI reads the cached snapshot through an authenticated Fetch route:
 *
 *   GET  /api/auto-lwf-sr/snapshot   → cached snapshot
 *   POST /api/auto-lwf-sr/snapshot   → resample status now (+ catalog if stale)
 */

import { fetchStatus } from './status.js'
import { fetchBenchmarks } from './benchmarks.js'
import { fetchPricing } from './pricing.js'
import { computeSnapshot, DEFAULT_WEIGHTS } from './score.js'

export const name = 'autoLwfSr'
export const inject = ['connection']

export const ROUTE = '/api/auto-lwf-sr/snapshot'

const DEFAULTS = {
  statusRefreshSeconds: 20,
  refreshMinutes: 10,
  startupDelayMs: 2_000,
  requestTimeoutMs: 15_000,
  catalogStaleMs: 5 * 60_000,
  weights: DEFAULT_WEIGHTS,
}

const responseHeaders = { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' }

const log = (...args) => {
  try {
    console.log('[auto-lwf-sr]', ...args)
  } catch {
    /* logging is best effort */
  }
}

function withTimeout(promise, ms, label) {
  let timer
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label + ' timed out after ' + ms + 'ms')), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

export class AutoLwfSrService {
  constructor(options = {}) {
    this.options = { ...DEFAULTS, ...options }
    this.snapshot = null
    this.history = []
    this.status = null
    this.benchmarks = null
    this.pricing = null
    this.catalogAt = 0
    this.errors = { status: null, benchmarks: null, pricing: null }
    this.listeners = new Set()
    this.disposed = false
    this.statusFlight = null
    this.catalogFlight = null
    this.refreshFlight = null
  }

  getSnapshot() {
    return this.snapshot
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  publish(snapshot) {
    this.snapshot = snapshot
    for (const listener of this.listeners) {
      try {
        listener(snapshot)
      } catch {
        /* a bad subscriber must not break the sampler */
      }
    }
  }

  /** Fast path: current service state only; recompute against cached catalog. */
  sampleStatus() {
    if (this.statusFlight) return this.statusFlight
    const timeout = this.options.requestTimeoutMs
    this.statusFlight = (async () => {
      try {
        this.status = await withTimeout(fetchStatus({ timeoutMs: timeout }), timeout + 1_000, 'status')
        this.errors.status = null
      } catch (error) {
        this.errors.status = String(error?.message || error)
        if (!this.status) throw error
      }
      return this.recompute()
    })().finally(() => {
      this.statusFlight = null
    })
    return this.statusFlight
  }

  /** Slow path: intelligence scores and prices. */
  sampleCatalog() {
    if (this.catalogFlight) return this.catalogFlight
    const timeout = this.options.requestTimeoutMs
    this.catalogFlight = (async () => {
      const results = await Promise.allSettled([
        withTimeout(fetchBenchmarks({ timeoutMs: timeout }), timeout + 1_000, 'benchmarks'),
        withTimeout(fetchPricing({ timeoutMs: timeout }), timeout + 1_000, 'pricing'),
      ])
      const [benchmarks, pricing] = results
      if (benchmarks.status === 'fulfilled') {
        this.benchmarks = benchmarks.value
        this.errors.benchmarks = null
      } else {
        this.errors.benchmarks = String(benchmarks.reason?.message || benchmarks.reason)
      }
      if (pricing.status === 'fulfilled') {
        this.pricing = pricing.value
        this.errors.pricing = null
      } else {
        this.errors.pricing = String(pricing.reason?.message || pricing.reason)
      }
      if (this.benchmarks || this.pricing) this.catalogAt = Date.now()
      return this.recompute()
    })().finally(() => {
      this.catalogFlight = null
    })
    return this.catalogFlight
  }

  /** Compose one snapshot from whatever sources are currently available. */
  recompute() {
    if (!this.status && !this.benchmarks && !this.pricing) {
      throw new Error(['status', 'benchmarks', 'pricing'].map(key => this.errors[key]).filter(Boolean).join('; ') || 'no source available')
    }
    const errors = []
    for (const key of ['status', 'benchmarks', 'pricing']) {
      if (this.errors[key]) errors.push(key + ': ' + this.errors[key])
    }
    const snapshot = computeSnapshot(
      {
        status: this.status,
        benchmarks: this.benchmarks,
        pricing: this.pricing,
        history: this.history,
        errors,
      },
      this.options.weights,
    )
    this.history = snapshot.history
    this.publish(snapshot)
    return snapshot
  }

  /** Full refresh (status + catalog) — used at startup and by explicit POST refresh. */
  refresh() {
    if (this.refreshFlight) return this.refreshFlight
    this.refreshFlight = (async () => {
      await Promise.allSettled([this.sampleStatus(), this.sampleCatalog()])
      return this.snapshot
    })().finally(() => {
      this.refreshFlight = null
    })
    return this.refreshFlight
  }

  /** On-demand refresh from the UI: status now, catalog in the background when stale. */
  async onDemand() {
    const stale = Date.now() - this.catalogAt > this.options.catalogStaleMs
    if (stale) {
      this.sampleCatalog().catch(error => log('catalog refresh failed:', String(error?.message || error)))
    }
    try {
      await this.sampleStatus()
    } catch (error) {
      log('status refresh failed:', String(error?.message || error))
    }
    return this.snapshot
  }

  dispose() {
    this.disposed = true
    this.listeners.clear()
  }
}

export function apply(ctx, config = {}) {
  const options = { ...DEFAULTS, ...(config && typeof config === 'object' ? config : {}) }
  const service = new AutoLwfSrService(options)
  ctx.provide('autoLwfSr', service)

  const statusEvery = Math.max(5_000, Number(options.statusRefreshSeconds) * 1_000)
  const catalogEvery = Math.max(60_000, Number(options.refreshMinutes) * 60_000)

  ctx.effect(() => {
    let statusTimer
    let catalogTimer
    const startStatus = () => {
      if (service.disposed) return
      service.sampleStatus().catch(error => log('status sample failed:', String(error?.message || error)))
      statusTimer = setInterval(() => {
        if (!service.disposed) {
          service.sampleStatus().catch(error => log('status sample failed:', String(error?.message || error)))
        }
      }, statusEvery)
      if (typeof statusTimer.unref === 'function') statusTimer.unref()
    }
    const startCatalog = () => {
      if (service.disposed) return
      service.sampleCatalog().catch(error => log('catalog sample failed:', String(error?.message || error)))
      catalogTimer = setInterval(() => {
        if (!service.disposed) {
          service.sampleCatalog().catch(error => log('catalog sample failed:', String(error?.message || error)))
        }
      }, catalogEvery)
      if (typeof catalogTimer.unref === 'function') catalogTimer.unref()
    }
    const bootStatus = setTimeout(startStatus, Math.max(0, Number(options.startupDelayMs) || 0))
    const bootCatalog = setTimeout(startCatalog, Math.max(0, Number(options.startupDelayMs) || 0) + 500)
    if (typeof bootStatus.unref === 'function') bootStatus.unref()
    if (typeof bootCatalog.unref === 'function') bootCatalog.unref()
    return () => {
      clearTimeout(bootStatus)
      clearTimeout(bootCatalog)
      clearInterval(statusTimer)
      clearInterval(catalogTimer)
      service.dispose()
    }
  }, 'auto-lwf-sr.samplers')

  ctx.effect(() => {
    const dispose = ctx.connection.fetch.register({
      path: ROUTE,
      methods: ['GET', 'POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          if (request.method === 'POST') await service.onDemand()
          const snapshot = service.getSnapshot()
          if (snapshot === null) {
            return Response.json(
              { ok: false, pending: true, error: service.errors.status || service.errors.benchmarks || service.errors.pricing || null },
              { headers: responseHeaders },
            )
          }
          return Response.json({ ok: true, snapshot }, { headers: responseHeaders })
        } catch (error) {
          return Response.json(
            { ok: false, error: String(error?.message || error) },
            { status: 500, headers: responseHeaders },
          )
        }
      },
    })
    return () => { void dispose() }
  }, 'auto-lwf-sr.snapshot-route')
}
