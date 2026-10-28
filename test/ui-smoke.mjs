/**
 * UI smoke test for plugin/lib/client.js (jsdom, no browser).
 *
 * Renders the floating widget against a synthetic snapshot, then exercises the
 * popover, tabs, settings panel, avatar size, dragging and refresh button.
 *
 *   npm install
 *   npm run test:ui
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'

import { computeSnapshot } from '../plugin/lib/score.js'

const requireFromTest = createRequire(import.meta.url)

function buildFixtureSnapshot() {
  const status = {
    overall: 'operational',
    grade: { level: 'operational', letter: 'S', value: 1 },
    uptime24h: 100,
    uptimeApi: 100,
    components: [
      { name: 'DeepSeek V4 Pro API服务(API Service)', status: 'operational', uptime: 99.9 },
      { name: 'DeepSeek V4.1 Flash API服务(API Service)', status: 'operational', uptime: 99.9 },
    ],
    activeIncidents: [],
    fetchedAt: Date.now(),
  }
  const benchmarks = {
    models: [
      { label: 'DeepSeek V4.1 Flash', vendor: 'DeepSeek', score: 32, deepseek: true, matchedName: 'DeepSeek V4.1 Flash 1017 (max)', percentile: 0.5 },
      { label: 'GPT-6.1 Terra Pro', vendor: 'OpenAI', score: 51, deepseek: false, percentile: 0.85 },
    ],
    frontier: 58,
    median: 32,
    universeSize: 76,
    fetchedAt: Date.now(),
  }
  const peers = [2, 8, 4, 3, 6, 4.3, 4, 0.525].map((price, index) => ({
    label: 'peer-' + index,
    vendor: 'peer',
    blendedPerMillion: price,
    deepseek: false,
  }))
  const deepseekRows = [
    { label: 'DeepSeek V4 Pro', blendedPerMillion: 1.194, deepseek: true, mainstream: true },
    { label: 'DeepSeek V4.1 Flash', blendedPerMillion: 0.21, deepseek: true, mainstream: true },
    { label: 'DeepSeek V4.1 Flash 1017', blendedPerMillion: 0.525, deepseek: true, mainstream: false },
  ]
  const pricing = {
    rows: [...deepseekRows, ...peers],
    deepseek: { label: 'DeepSeek V4 Pro', blendedPerMillion: 1.194 },
    composite: { blendedPerMillion: 0.501, parts: deepseekRows.filter(row => row.mainstream) },
    peerMedian: 4,
    fetchedAt: Date.now(),
  }
  return computeSnapshot({ status, benchmarks, pricing })
}

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://127.0.0.1:55274/',
  pretendToBeVisual: true,
})
const { window } = dom
globalThis.window = window
globalThis.document = window.document
try {
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
} catch {}
globalThis.Node = window.Node
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)

const snapshot = buildFixtureSnapshot()
const calls = []
const fetchStub = async (url, options = {}) => {
  calls.push({ url: String(url), method: options.method || 'GET' })
  return { ok: true, status: 200, json: async () => ({ ok: true, snapshot }) }
}
window.fetch = fetchStub
globalThis.fetch = fetchStub

let captured = null
window.__ModuleLoader__ = { load(module) { captured = module } }
const source = readFileSync(new URL('../plugin/lib/client.js', import.meta.url), 'utf8')
new Function('window', 'require', source)(window, requireFromTest)

const assert = (condition, message) => {
  if (!condition) throw new Error('ASSERT: ' + message)
}

assert(captured && captured.id === 'dsh-plugin-auto-lwf-sr', 'module id matches package name')
const plugin = captured.factory(id => (id === 'react' ? React : undefined))
assert(plugin && typeof plugin.apply === 'function', 'factory returns a plugin object')

let entry = null
const injected = []
const fakeCtx = {
  slots: {
    inject(key, callback) {
      injected.push(key)
      callback()
      return () => {}
    },
    register(options, component) {
      entry = { options, component }
      return () => {}
    },
  },
  locale: {
    getLocale: () => ({ active: 'zh' }),
    subscribe: () => () => {},
  },
}
plugin.apply(fakeCtx)
assert(injected.includes('shell.overlay'), 'registers into shell.overlay')
assert(entry && entry.options.id === 'auto-lwf-sr', 'slot entry id')

const root = createRoot(document.getElementById('app'))
const flush = async (ms = 80) => {
  await new Promise(resolve => setTimeout(resolve, ms))
}
const text = () => document.body.textContent
const panelNode = () => document.querySelector('[data-lwf-panel]')

root.render(React.createElement(entry.component, { sessionId: 'test-session' }))
await flush(900)

assert(calls.some(call => call.url.includes('/api/auto-lwf-sr/snapshot') && call.method === 'GET'), 'fetches the snapshot route')
const chip = document.querySelector('[data-lwf-chip]')
assert(chip, 'compact chip exists')
assert(text().includes(snapshot.tier.name), 'chip shows the scored tier')
assert(text().includes(snapshot.score.toFixed(1)), 'chip shows the score')
assert(!document.querySelector('[data-lwf-track]'), 'no slider in the outer layer')

chip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(140)
assert(panelNode(), 'popover opens on click')
assert(panelNode().textContent.includes('因子'), 'panel has factor tab')
assert(panelNode().textContent.includes('稳定度'), 'factor tab content rendered')
assert(panelNode().textContent.includes('拖动滑片试滑'), 'manual slider hint present')
assert(document.querySelector('[data-lwf-track]'), 'slider exists in the secondary panel')

const scoresTab = [...panelNode().querySelectorAll('[data-lwf-tab]')].find(node => node.textContent === '评分')
assert(scoresTab, 'scores tab exists')
scoresTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(60)
assert(panelNode().textContent.includes('DeepSeek V4.1 Flash'), 'scores tab lists DeepSeek')
assert(panelNode().textContent.includes('DeepSeek V4.1 Flash 1017 (max)'), 'scores caption names the exact AA variant')

const pricesTab = [...document.querySelectorAll('[data-lwf-tab]')].find(node => node.textContent === '价格')
pricesTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(60)
assert(panelNode().textContent.includes('$1.19'), 'prices tab shows DeepSeek blended price')
assert(panelNode().textContent.includes('OpenRouter 基础报价'), 'prices tab explains the OpenRouter base price')

const track = document.querySelector('[data-lwf-track]')
Object.defineProperty(track, 'getBoundingClientRect', {
  value: () => ({ left: 0, top: 0, width: 300, height: 22, right: 300, bottom: 22, x: 0, y: 0 }),
})
track.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientX: 290 }))
await flush(60)
assert(panelNode().textContent.includes('试滑'), 'dragging the rheostat previews a tier')
assert(panelNode().textContent.includes('梁祖'), 'previewing the top tier')
track.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }))

const gear = document.querySelector('[data-lwf-settings-toggle]')
assert(gear, 'settings gear exists')
gear.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(80)
assert(document.querySelector('[data-lwf-settings]'), 'settings panel opens')
const settingsEl = document.querySelector('[data-lwf-settings]')
const detailBody = document.querySelector('[data-lwf-body]')
assert(settingsEl.closest('[data-lwf-panel]'), 'settings lives inside the panel')
assert(detailBody && !detailBody.contains(settingsEl), 'settings is not nested in the hidden detail body')
assert(settingsEl.style.padding === '16px 20px 18px', 'settings view has generous padding')
assert(panelNode().textContent.includes('显示形式'), 'settings: display mode row')
assert(panelNode().textContent.includes('立绘大小'), 'settings: artwork size row')
assert(panelNode().textContent.includes('重置位置'), 'settings: reset position')

const stickerSwitch = document.querySelector('[data-lwf-mode-switch="sticker"]')
assert(stickerSwitch, 'avatar mode switch exists in settings')
stickerSwitch.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(90)
const stickerChip = document.querySelector('[data-lwf-chip]')
assert(stickerChip.getAttribute('data-lwf-mode') === 'sticker', 'chip switched to avatar mode')
assert((stickerChip.textContent || '').trim() === '', 'avatar mode shows the image only')
const artNode = stickerChip.querySelector('svg, div')
assert(artNode && (artNode.tagName.toLowerCase() === 'svg' || (artNode.style.backgroundImage || '').includes('data:image')), 'avatar renders artwork')
assert(JSON.parse(window.localStorage.getItem('dsh.auto-lwf-sr.display')) === 'sticker', 'display-mode choice persisted')

const slider = document.querySelector('[data-lwf-size]')
assert(slider, 'artwork size slider exists')
const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
valueSetter.call(slider, '120')
slider.dispatchEvent(new window.Event('input', { bubbles: true }))
slider.dispatchEvent(new window.Event('change', { bubbles: true }))
await flush(80)
assert(window.localStorage.getItem('dsh.auto-lwf-sr.size') === '120', 'artwork size persisted')
assert(document.querySelector('[data-lwf-chip] svg, [data-lwf-chip] div').getAttribute('width') === '120' || document.querySelector('[data-lwf-chip] svg, [data-lwf-chip] div').style.width === '120px', 'artwork resized to 120px')

const dragChip = document.querySelector('[data-lwf-chip]')
dragChip.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 500, clientY: 500 }))
dragChip.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 460, clientY: 470 }))
dragChip.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }))
await flush(320)
const savedPos = JSON.parse(window.localStorage.getItem('dsh.auto-lwf-sr.position'))
assert(savedPos && Math.round(savedPos.right) === 60 && Math.round(savedPos.bottom) === 214, 'drag position persisted (60, 214)')
assert(!document.querySelector('[data-lwf-panel]'), 'panel closes while dragging')

dragChip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(200)
assert(document.querySelector('[data-lwf-panel]'), 'chip click reopens the panel')
const refresh = [...document.querySelectorAll('button')].find(button => (button.textContent || '').includes('刷新'))
assert(refresh, 'refresh button exists')
refresh.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(80)
assert(calls.some(call => call.method === 'POST'), 'refresh posts to the route')

const close = [...document.querySelectorAll('button')].find(button => button.textContent === '✕')
close.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
await flush(300)
assert(!document.querySelector('[data-lwf-panel]'), 'close button collapses the panel')

root.unmount()
console.log('UI smoke: PASS')
console.log('score', snapshot.score, 'tier', snapshot.tier.name, 'requests', calls.length)
