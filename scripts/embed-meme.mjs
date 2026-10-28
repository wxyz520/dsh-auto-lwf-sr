#!/usr/bin/env node
/**
 * Embed a personal six-panel image sprite into the widget.
 *
 *   node scripts/embed-meme.mjs path/to/six-panels.png
 *
 * The widget expects a horizontal sprite of six square panels (for example
 * 1080x180, i.e. six 180px panels). A transparent PNG sticker sheet looks best.
 *
 * The image is embedded into plugin/lib/client.js as a base64 data URL. That
 * file is tracked by git, so DO NOT commit the result: the artwork you embed is
 * your own responsibility, and the public repository ships with the original
 * SVG artwork instead.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const input = process.argv[2]
if (!input) {
  console.error('usage: node scripts/embed-meme.mjs path/to/six-panels.png')
  process.exit(1)
}

const extension = extname(input).toLowerCase()
const mime = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg'
const bytes = readFileSync(resolve(input))
const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`

const target = fileURLToPath(new URL('../plugin/lib/client.js', import.meta.url))
const source = readFileSync(target, 'utf8')
const replaced = source.replace(/const MEME_SPRITE = (?:''|'data:[^']*')/, `const MEME_SPRITE = '${dataUrl}'`)
if (replaced === source) {
  console.error('could not find the MEME_SPRITE marker in plugin/lib/client.js')
  process.exit(1)
}
writeFileSync(target, replaced)
console.log(`embedded ${(bytes.length / 1024).toFixed(1)} KB from ${input} into plugin/lib/client.js`)
console.log('remember: do not commit this change; restore with `git checkout -- plugin/lib/client.js`')
