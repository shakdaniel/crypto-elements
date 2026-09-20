import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as core from '../packages/core/dist/index.js'

test('lookup by id, alias and chain id', () => {
  assert.equal(core.getIcon('ETH')?.name, 'Ethereum')
  assert.equal(core.getIcon('bsc')?.id, 'BNB')
  assert.equal(core.getIcon('JUP')?.id, 'jupiter')
  assert.equal(core.getIcon('1inch')?.name, '1inch')
  assert.equal(core.getIconByChainId(8453)?.id, 'BASE')
  assert.equal(core.getIcon('nope'), undefined)
})

test('type disambiguates Hyperliquid the chain from the venue', () => {
  assert.equal(core.getChainIcon('hyperliquid')?.id, 'HYPE')
  assert.equal(core.getDexIcon('hyperliquid')?.id, 'hyperliquid')
})

test('toSvg renders a standalone, sized, accessible document', () => {
  const svg = core.toSvg('uniswap', { size: 32, title: 'Uniswap' })
  assert.match(svg, /^<svg /)
  assert.match(svg, /viewBox="0 0 32 32"/)
  assert.match(svg, /width="32" height="32"/)
  assert.match(svg, /role="img"><title>Uniswap<\/title>/)
  assert.ok(!svg.includes('aria-hidden'))

  const decorative = core.toSvg('uniswap')
  assert.match(decorative, /aria-hidden="true"/)
})

test('mono and color render the currentColor variant', () => {
  const mono = core.toSvg('SOL', { mono: true })
  assert.match(mono, /fill="currentColor"/)
  assert.doesNotMatch(mono, /#9945FF/)
  assert.match(core.toSvg('SOL', { color: '#f00' }), /style="color:#f00"/)
})

test('toDataUri round-trips to the same markup', () => {
  const uri = core.toDataUri('BASE', { size: 16 })
  assert.ok(uri.startsWith('data:image/svg+xml,'))
  assert.equal(decodeURIComponent(uri.slice('data:image/svg+xml,'.length)), core.toSvg('BASE', { size: 16 }))
})

test('toSvg throws a named error for unknown ids', () => {
  assert.throws(() => core.toSvg('dogecoin'), /unknown icon: "dogecoin"/)
})

test('titles and attributes are escaped', () => {
  const svg = core.toSvg('ETH', { title: '<script>x</script>', attrs: { 'data-x': '"' } })
  assert.doesNotMatch(svg, /<script>/)
  assert.match(svg, /data-x="&quot;"/)
})

test('search matches ids, names and aliases', () => {
  assert.ok(core.searchIcons('pump').length >= 2)
  assert.ok(core.searchIcons('binance').some((i) => i.id === 'BNB'))
  assert.equal(core.searchIcons('', 'chain').length, core.CHAIN_IDS.length)
  assert.equal(core.searchIcons('').length, core.icons.length)
})

test('every icon exposes usable metadata', () => {
  for (const icon of core.icons) {
    assert.ok(icon.name && icon.viewBox && icon.body && icon.mono, icon.id)
    assert.ok(icon.colors.length > 0, `${icon.id} has no colours`)
    assert.match(core.toSvg(icon), /<svg /)
  }
})
