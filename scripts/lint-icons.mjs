#!/usr/bin/env node
/** Structural checks on the SVG sources — runs in CI before anything is generated. */
import { readFile, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(await readFile(join(root, 'icons/registry.json'), 'utf8'))
const errors = []
const warn = []

for (const type of ['chain', 'dex']) {
  const files = (await readdir(join(root, 'icons', type))).filter((f) => f.endsWith('.svg'))
  const listed = new Set(registry[type].map((e) => e.file))
  for (const f of files) if (!listed.has(f)) errors.push(`icons/${type}/${f} is not in registry.json`)

  for (const entry of registry[type]) {
    const path = `icons/${type}/${entry.file}`
    let svg
    try {
      svg = await readFile(join(root, path), 'utf8')
    } catch {
      errors.push(`${path} listed in registry.json but missing on disk`)
      continue
    }
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1]
    if (!vb) errors.push(`${path}: missing viewBox`)
    else {
      const [x, y, w, h] = vb.split(/[\s,]+/).map(Number)
      if (x !== 0 || y !== 0) errors.push(`${path}: viewBox must start at "0 0" (got "${vb}")`)
      if (w !== h) errors.push(`${path}: viewBox must be square (got ${w}x${h})`)
    }
    if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) errors.push(`${path}: missing xmlns`)
    if (/<(script|foreignObject|image)\b/i.test(svg)) errors.push(`${path}: contains disallowed element`)
    if (/\son[a-z]+="/i.test(svg)) errors.push(`${path}: contains an inline event handler`)
    if (/<text\b/i.test(svg)) warn.push(`${path}: uses <text> — convert to paths so it renders without the font`)
    if (/\bfont-family\b/i.test(svg)) warn.push(`${path}: references a font-family`)
    if (!entry.name) errors.push(`${path}: registry entry has no name`)
    if (!['official-geometry', 'approximate'].includes(entry.fidelity))
      errors.push(`${path}: fidelity must be "official-geometry" or "approximate"`)
  }
}

for (const w of warn) console.warn(`! ${w}`)
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`)
  process.exit(1)
}
console.log(`✔ ${registry.chain.length + registry.dex.length} icon sources look good`)
