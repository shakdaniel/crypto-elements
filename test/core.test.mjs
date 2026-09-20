import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../build/icons.json', import.meta.url), 'utf8'))
const generated = await readFile(new URL('../packages/core/src/generated.ts', import.meta.url), 'utf8')
const ids = await readFile(new URL('../packages/core/src/ids.ts', import.meta.url), 'utf8')
const react = await readFile(new URL('../packages/react/src/generated.tsx', import.meta.url), 'utf8')

test('every registry entry is generated', () => {
  assert.equal(manifest.count, manifest.icons.length)
  for (const icon of manifest.icons) {
    assert.match(generated, new RegExp(`id: "${icon.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
  }
})

test('the requested ids are all present', () => {
  const dex = ['uniswap','pancakeswap','aerodrome','orca','raydium','curve','meteora','hyperliquid','dydx','jupiter','pumpswap','pumpfun','1inch']
  const chain = ['SOL','ETH','BASE','BNB','ARB','OP','MATIC','AVAX','HYPE','WETH']
  const have = new Map(manifest.icons.map((i) => [`${i.type}:${i.id}`, i]))
  for (const id of dex) assert.ok(have.has(`dex:${id}`), `missing dex ${id}`)
  for (const id of chain) assert.ok(have.has(`chain:${id}`), `missing chain ${id}`)
})

test('ids and aliases are unique within a type', () => {
  for (const type of ['chain', 'dex']) {
    const seen = new Set()
    for (const icon of manifest.icons.filter((i) => i.type === type)) {
      for (const key of [icon.id, ...icon.aliases].map((k) => k.toLowerCase())) {
        assert.ok(!seen.has(key), `duplicate key "${key}" in ${type}`)
        seen.add(key)
      }
    }
  }
})

test('generated TypeScript declares every id in the unions', () => {
  for (const icon of manifest.icons) {
    const union = icon.type === 'chain' ? 'ChainId' : 'DexId'
    assert.ok(ids.includes(`| "${icon.id}"`), `${icon.id} missing from ${union}`)
  }
})

test('React exports one component per icon', () => {
  for (const icon of manifest.icons) {
    assert.ok(react.includes(`export const ${icon.component} =`), `missing <${icon.component} />`)
  }
})

test('svg bodies carry no scripts, events or external references', () => {
  assert.doesNotMatch(generated, /<script/i)
  assert.doesNotMatch(generated, /\son[a-z]+=\\"/i)
  assert.doesNotMatch(generated, /href=\\"http/i)
})

test('gradient ids are namespaced per icon', () => {
  const gradientIcons = manifest.icons.filter((i) => generated.includes(`ce-${i.id.toLowerCase()}-`))
  assert.ok(gradientIcons.length > 0, 'expected at least one icon with internal ids')
  const rawIds = generated.match(/id=\\"(?!ce-)[^"]+\\"/g)
  assert.equal(rawIds, null, `un-namespaced ids: ${rawIds}`)
})

test('mono variants drop hard-coded paint', () => {
  const monoBlocks = generated.match(/mono: "[^"]*"/g) ?? []
  assert.ok(monoBlocks.length === manifest.count)
  for (const block of monoBlocks) {
    assert.doesNotMatch(block, /#[0-9a-fA-F]{3,8}/, `mono variant still has a hex colour: ${block.slice(0, 80)}`)
    assert.doesNotMatch(block, /url\(#/, 'mono variant still references a gradient')
  }
})

test('mono variants stay distinguishable from one another', () => {
  // Hyperliquid ships one brand mark for both its chain and its venue.
  const allowedDuplicates = new Set(['HYPE|hyperliquid'])
  const byMono = new Map()
  for (const m of generated.matchAll(/id: "([^"]+)",[\s\S]*?mono: (".*?"),\n/g)) {
    const [id, mono] = [m[1], m[2]]
    const twin = byMono.get(mono)
    if (twin) {
      assert.ok(
        allowedDuplicates.has(`${twin}|${id}`) || allowedDuplicates.has(`${id}|${twin}`),
        `${id} and ${twin} render identical mono variants`,
      )
    } else {
      byMono.set(mono, id)
    }
  }
})

test('mono variants keep a glyph rather than collapsing to the backdrop', () => {
  // A badge icon whose backdrop survives into mono shows up as a lone filled circle.
  for (const m of generated.matchAll(/id: "([^"]+)",[\s\S]*?mono: (".*?"),\n/g)) {
    const [id, mono] = [m[1], JSON.parse(m[2])]
    if (/^<circle cx="16" cy="16" r="14"[^>]*\/>$/.test(mono.trim())) {
      assert.fail(`${id}: mono variant is just the backdrop — mark it data-mono="drop"`)
    }
  }
})
