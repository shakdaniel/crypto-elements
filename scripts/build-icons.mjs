#!/usr/bin/env node
/**
 * Single source of truth: icons/registry.json + icons/<type>/<file>.svg
 *
 * Generates:
 *   packages/core/src/generated.ts     typed icon data + maps
 *   packages/react/src/generated.tsx   one React component per icon
 *   build/svg/<type>/<id>.svg          normalised colour SVGs (site + CDN + release zip)
 *   build/svg/mono/<type>/<id>.svg     currentColor variants
 *   build/icons.json                   machine-readable manifest
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const TYPES = ['chain', 'dex']

let optimize = null
try {
  ;({ optimize } = await import('svgo'))
} catch {
  console.warn('! svgo not installed — falling back to basic whitespace minification')
}

const read = (p) => readFile(join(root, p), 'utf8')
const write = async (p, s) => {
  await mkdir(dirname(join(root, p)), { recursive: true })
  await writeFile(join(root, p), s)
}

/** `1inch` -> `oneInch`, `ETH` -> `eth`, `pump-fun` -> `pumpFun` */
const DIGITS = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' }
function exportName(id) {
  let s = id.toLowerCase().replace(/[^a-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
  if (/^[0-9]/.test(s)) s = DIGITS[s[0]] + s.slice(1, 2).toUpperCase() + s.slice(2)
  return s
}
const componentName = (id) => {
  const n = exportName(id)
  return n[0].toUpperCase() + n.slice(1) + 'Icon'
}

function minify(svg) {
  if (optimize) {
    return optimize(svg, {
      multipass: true,
      plugins: [
        { name: 'preset-default', params: { overrides: { removeViewBox: false, cleanupIds: false } } },
        { name: 'removeDimensions' },
      ],
    }).data
  }
  return svg.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()
}

/** Namespace internal ids so multiple icons can coexist in one document. */
function namespaceIds(body, id) {
  const prefix = `ce-${id.toLowerCase()}-`
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
  for (const old of ids) {
    const esc = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    body = body
      .replace(new RegExp(`(\\sid=")${esc}(")`, 'g'), `$1${prefix}${old}$2`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}${old})`)
      .replace(new RegExp(`((?:xlink:)?href=")#${esc}(")`, 'g'), `$1#${prefix}${old}$2`)
  }
  return body
}

const SHAPES = 'path|circle|ellipse|rect|polygon|polyline|line'

/**
 * Colour -> currentColor.
 *
 * Elements marked `data-mono="drop"` are removed rather than recoloured: a badge
 * backdrop or a knocked-out detail (an eye, a divider) would otherwise flood the
 * icon with a single solid shape once every fill collapses to currentColor.
 */
function toMono(body) {
  return body
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/<g\b[^>]*data-mono="drop"[^>]*>[\s\S]*?<\/g>/g, '')
    .replace(new RegExp(`<(${SHAPES})\\b[^>]*data-mono="drop"[^>]*\\/>`, 'g'), '')
    .replace(new RegExp(`<(${SHAPES})\\b[^>]*data-mono="drop"[^>]*>[\\s\\S]*?<\\/\\1>`, 'g'), '')
    .replace(/(fill|stroke)="(?!none")[^"]*"/g, (_m, attr) => `${attr}="currentColor"`)
    .replace(/(fill|stroke)-opacity="[^"]*"/g, '')
    .replace(/\sopacity="[^"]*"/g, '')
    .replace(/\sdata-mono="[^"]*"/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** The annotation is build-time metadata — it never reaches the colour output. */
const stripAnnotations = (body) => body.replace(/\sdata-mono="[^"]*"/g, '')

function parse(raw, id) {
  const svg = minify(raw)
  const open = svg.match(/<svg\b[^>]*>/)
  if (!open) throw new Error(`${id}: no <svg> root`)
  const viewBox = (open[0].match(/viewBox="([^"]+)"/) || [])[1]
  if (!viewBox) throw new Error(`${id}: missing viewBox`)
  const body = svg.slice(open.index + open[0].length, svg.lastIndexOf('</svg>')).trim()
  if (!body) throw new Error(`${id}: empty icon`)
  return { viewBox, body: namespaceIds(body, id) }
}

const wrap = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>\n`

// ---------------------------------------------------------------- build

const registry = JSON.parse(await read('icons/registry.json'))
await rm(join(root, 'build'), { recursive: true, force: true })

const icons = []
const seen = new Map()

for (const type of TYPES) {
  for (const entry of registry[type]) {
    const raw = await read(`icons/${type}/${entry.file}`)
    const { viewBox, body: annotated } = parse(raw, entry.id)
    const mono = toMono(annotated)
    const body = stripAnnotations(annotated)

    let name = exportName(entry.id)
    if (seen.has(name)) name = `${type}${name[0].toUpperCase()}${name.slice(1)}`
    seen.set(name, entry.id)

    const icon = {
      id: entry.id,
      type,
      name: entry.name,
      exportName: name,
      componentName: componentName(name),
      viewBox,
      colors: entry.colors ?? [],
      aliases: entry.aliases ?? [],
      website: entry.website ?? null,
      symbol: entry.symbol ?? null,
      evmChainId: entry.evmChainId ?? null,
      chains: entry.chains ?? null,
      fidelity: entry.fidelity ?? 'approximate',
      note: entry.note ?? null,
      body,
      mono,
    }
    icons.push(icon)

    await write(`build/svg/${type}/${entry.id.toLowerCase()}.svg`, wrap(viewBox, body))
    await write(`build/svg/mono/${type}/${entry.id.toLowerCase()}.svg`, wrap(viewBox, mono))
  }
}

// Alias collision check — aliases must resolve to exactly one icon.
const lookup = new Map()
for (const icon of icons) {
  for (const key of [icon.id, ...icon.aliases]) {
    const k = key.toLowerCase()
    const prev = lookup.get(k)
    if (prev && prev.type === icon.type) throw new Error(`alias "${key}" claimed by ${prev.id} and ${icon.id}`)
    if (!prev) lookup.set(k, icon)
  }
}

const q = (v) => JSON.stringify(v)
const dataLiteral = (i) => `{
  id: ${q(i.id)},
  type: ${q(i.type)},
  name: ${q(i.name)},
  viewBox: ${q(i.viewBox)},
  colors: ${q(i.colors)},
  aliases: ${q(i.aliases)},
  website: ${q(i.website)},
  symbol: ${q(i.symbol)},
  evmChainId: ${q(i.evmChainId)},
  chains: ${q(i.chains)},
  fidelity: ${q(i.fidelity)},
  body: ${q(i.body)},
  mono: ${q(i.mono)},
}`

const chains = icons.filter((i) => i.type === 'chain')
const dexes = icons.filter((i) => i.type === 'dex')

await write(
  'packages/core/src/generated.ts',
  `// AUTO-GENERATED by scripts/build-icons.mjs — do not edit by hand.
/* eslint-disable */
import type { IconData } from './types'

${icons.map((i) => `export const ${i.exportName}: IconData = ${dataLiteral(i)}`).join('\n\n')}

export const chainIcons = {
${chains.map((i) => `  ${q(i.id)}: ${i.exportName},`).join('\n')}
} as const

export const dexIcons = {
${dexes.map((i) => `  ${q(i.id)}: ${i.exportName},`).join('\n')}
} as const
`,
)

await write(
  'packages/core/src/ids.ts',
  `// AUTO-GENERATED by scripts/build-icons.mjs — do not edit by hand.
export type ChainId =
${chains.map((i) => `  | ${q(i.id)}`).join('\n')}

export type DexId =
${dexes.map((i) => `  | ${q(i.id)}`).join('\n')}

export type IconId = ChainId | DexId

export const CHAIN_IDS: readonly ChainId[] = [${chains.map((i) => q(i.id)).join(', ')}]
export const DEX_IDS: readonly DexId[] = [${dexes.map((i) => q(i.id)).join(', ')}]
`,
)

await write(
  'packages/react/src/generated.tsx',
  `// AUTO-GENERATED by scripts/build-icons.mjs — do not edit by hand.
/* eslint-disable */
import { ${icons.map((i) => i.exportName).join(', ')} } from '@crypto-elements/core'
import { createIcon } from './create-icon'

${icons.map((i) => `export const ${i.componentName} = /*#__PURE__*/ createIcon(${i.exportName})`).join('\n')}
`,
)

await write(
  'build/icons.json',
  JSON.stringify(
    {
      version: JSON.parse(await read('package.json')).version,
      count: icons.length,
      icons: icons.map(({ body, mono, exportName, componentName, ...rest }) => ({
        ...rest,
        component: componentName,
      })),
    },
    null,
    2,
  ) + '\n',
)

console.log(`✔ ${icons.length} icons (${chains.length} chains, ${dexes.length} dexes)`)
