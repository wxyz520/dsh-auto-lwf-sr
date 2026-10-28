/**
 * Plugin manifest checks: the install-facing contract and the DSH version guard.
 * Run with: node test/manifest.test.mjs
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pluginDir = join(root, 'plugin')
const manifest = JSON.parse(readFileSync(join(pluginDir, 'package.json'), 'utf8'))

assert.equal(manifest.name, 'dsh-plugin-auto-lwf-sr')
assert.match(manifest.version, /^\d+\.\d+\.\d+([-+].+)?$/)
assert.equal(manifest.type, 'module')
assert.equal(manifest.private, true)

// DSH version guard: without engines.dsh an incompatible DSH upgrade can only fail silently.
assert.ok(manifest.engines && typeof manifest.engines.dsh === 'string', 'engines.dsh is declared')
assert.ok(manifest.engines.dsh.trim().length > 0, 'engines.dsh range is not empty')
assert.match(manifest.engines.dsh, /\d+\.\d+\.\d+/, 'engines.dsh names a semantic version')
assert.ok(!manifest.engines.dsh.includes('workspace:'), 'engines.dsh must not use a workspace: range')
assert.ok(typeof manifest.engines.node === 'string' && manifest.engines.node.trim() !== '', 'engines.node is declared')

// Bundle wiring used by plugin_manager install_bundle.
assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
assert.equal(manifest.dsh?.client?.platform, 'web')
for (const key of ['.', './client', './icon', './locale/*.json', './package.json']) {
  assert.ok(manifest.exports?.[key], 'exports ' + key)
}
for (const file of ['lib', 'locale', 'icon.svg', 'cordis.patch.yml', 'README.md']) {
  assert.ok(manifest.files.includes(file), 'files includes ' + file)
}

const patch = readFileSync(join(pluginDir, 'cordis.patch.yml'), 'utf8')
assert.ok(patch.includes('id: auto-lwf-sr'), 'patch row id')
assert.ok(patch.includes("name: dsh-plugin-auto-lwf-sr"), 'patch row package name')
assert.ok(existsSync(join(pluginDir, 'icon.svg')), 'icon exists')
assert.ok(existsSync(join(pluginDir, 'lib/index.js')), 'host entry exists')
assert.ok(existsSync(join(pluginDir, 'lib/client.js')), 'client entry exists')
assert.ok(existsSync(join(pluginDir, 'locale/zh.json')), 'zh locale exists')
assert.ok(existsSync(join(pluginDir, 'locale/en.json')), 'en locale exists')

console.log('manifest checks: PASS', 'engines.dsh =', manifest.engines.dsh, '| version', manifest.version)
