import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { UniswapIcon, EthIcon, ChainIcon, DexIcon, CryptoIcon, HypeIcon, HyperliquidIcon } from '../packages/react/dist/index.js'

const render = (c, props) => renderToStaticMarkup(createElement(c, props))

test('named components render inline svg', () => {
  const html = render(UniswapIcon, { size: 32 })
  assert.match(html, /^<svg /)
  assert.match(html, /width="32" height="32"/)
  assert.match(html, /#FF007A/)
  assert.match(html, /aria-hidden="true"/)
})

test('title makes an icon announced instead of hidden', () => {
  const html = render(EthIcon, { title: 'Ethereum' })
  assert.match(html, /role="img"/)
  assert.match(html, /<title>Ethereum<\/title>/)
  assert.ok(!html.includes('aria-hidden'))
})

test('mono renders the currentColor variant', () => {
  const html = render(EthIcon, { mono: true })
  assert.match(html, /fill="currentColor"/)
  assert.doesNotMatch(html, /#8C8C8C/)
})

test('props pass through to the root element', () => {
  const html = render(UniswapIcon, { className: 'h-6 w-6', 'data-testid': 'uni' })
  assert.match(html, /class="h-6 w-6"/)
  assert.match(html, /data-testid="uni"/)
})

test('dynamic components resolve ids, aliases and types', () => {
  assert.match(render(ChainIcon, { id: 'BASE' }), /#0052FF/)
  assert.match(render(CryptoIcon, { id: 'bsc' }), /#F3BA2F/)
  // Hyperliquid ships one brand mark for both the chain and the venue, so only
  // the metadata distinguishes them.
  assert.equal(HypeIcon.icon.id, 'HYPE')
  assert.equal(HyperliquidIcon.icon.id, 'hyperliquid')
  assert.equal(render(ChainIcon, { id: 'hyperliquid' }), render(HypeIcon, {}))
})

test('an unknown id renders the fallback, not a crash', () => {
  assert.equal(render(CryptoIcon, { id: 'not-a-dex' }), '')
  assert.equal(render(CryptoIcon, { id: 'not-a-dex', fallback: createElement('span', null, '?') }), '<span>?</span>')
})

test('components carry their icon metadata', () => {
  assert.equal(UniswapIcon.icon.id, 'uniswap')
  assert.equal(EthIcon.icon.evmChainId, 1)
  assert.equal(UniswapIcon.displayName, 'UniswapIcon')
})
