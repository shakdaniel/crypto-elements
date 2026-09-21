<div align="center">

# Crypto Elements

**Open-source SVG logos and symbols for the crypto world.**

Chains, DEXes and protocols as real code — typed, tree-shakeable, `currentColor`-ready.

[![CI](https://github.com/shakdaniel/crypto-elements/actions/workflows/ci.yml/badge.svg)](https://github.com/shakdaniel/crypto-elements/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@crypto-elements/core?label=%40crypto-elements%2Fcore)](https://www.npmjs.com/package/@crypto-elements/core)
[![npm](https://img.shields.io/npm/v/@crypto-elements/react?label=%40crypto-elements%2Freact)](https://www.npmjs.com/package/@crypto-elements/react)
[![licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)

[Browse the icons →](https://shakdaniel.github.io/crypto-elements)

</div>

---

## Install

```bash
npm  i   @crypto-elements/react   # or @crypto-elements/core
pnpm add @crypto-elements/react
yarn add @crypto-elements/react
bun  add @crypto-elements/react
```

| Package | What it is |
| --- | --- |
| [`@crypto-elements/core`](packages/core) | Icon data + `toSvg()` / `toDataUri()`. No dependencies, works anywhere. |
| [`@crypto-elements/react`](packages/react) | One React component per icon, plus dynamic `<CryptoIcon id>`. |

Not using a bundler? Every icon is also served as a plain file:

```
https://shakdaniel.github.io/crypto-elements/svg/chain/eth.svg
https://shakdaniel.github.io/crypto-elements/svg/mono/dex/uniswap.svg
https://shakdaniel.github.io/crypto-elements/icons.json
```

## Use it

### React

```tsx
import { UniswapIcon, EthIcon, ChainIcon, DexIcon } from '@crypto-elements/react'

<UniswapIcon size={32} />                       // full colour
<EthIcon size={20} mono className="text-zinc-400" />  // inherits currentColor
<ChainIcon id="BASE" size={16} title="Base" />  // dynamic, accessible
<DexIcon id="jup" size={24} />                  // aliases work
```

Named components tree-shake — importing `UniswapIcon` pulls in one icon, not the set.
`<CryptoIcon />`, `<ChainIcon />` and `<DexIcon />` resolve at runtime, so they include everything.

### Anywhere else

```ts
import { toSvg, toDataUri, getIcon, icons, searchIcons } from '@crypto-elements/core'

el.innerHTML = toSvg('pumpfun', { size: 28, title: 'Pump.fun' })
el.style.backgroundImage = `url("${toDataUri('SOL', { size: 20 })}")`
badge.innerHTML = toSvg('ARB', { size: 16, color: '#64748b' })   // mono, tinted

getIcon('bsc')            // → BNB Chain (alias lookup)
getIconByChainId(8453)    // → Base
searchIcons('pump')       // → [PumpSwap, Pump.fun]
icons.length              // → 23
```

## What's in the box

**Chains (10)** — `ETH` `SOL` `BASE` `BNB` `ARB` `OP` `MATIC` `AVAX` `HYPE` `WETH`

**DEXes (13)** — `uniswap` `pancakeswap` `aerodrome` `orca` `raydium` `curve` `meteora`
`hyperliquid` `dydx` `jupiter` `pumpswap` `pumpfun` `1inch`

Every icon ships with metadata you can actually use:

```ts
{
  id: 'BASE', type: 'chain', name: 'Base',
  viewBox: '0 0 32 32',
  colors: ['#0052FF'],
  aliases: ['base-mainnet'],
  website: 'https://base.org',
  symbol: 'ETH', evmChainId: 8453,
  fidelity: 'official-geometry',
}
```

DEX entries also carry `chains: ['SOL']` so you can filter a venue list by the chain a user is on.

### Every icon has two variants

- **colour** — the brand mark as drawn.
- **mono** — the same geometry with every fill swapped to `currentColor`, so it takes the
  colour of surrounding text. Gradients are flattened; nothing references a `<defs>` block.

  Mono variants are generated, not hand-drawn, but they aren't a naive recolour: elements marked
  `data-mono="drop"` in the source — a badge backdrop, a knocked-out eye, a divider — are removed
  instead of recoloured, so an icon like OP Mainnet stays the letters `OP` rather than
  collapsing into a solid disc.

### Conventions

- Square `0 0 32 32` viewBox, artwork optically centred — icons line up in a row without per-icon nudging.
- No `<script>`, no event handlers, no external references, no embedded fonts. Enforced in CI.
- Internal ids (gradients, clips) are namespaced `ce-<id>-*`, so two icons never collide in one document.
- Chain ids are uppercase tickers, DEX ids are lowercase slugs.

## Fidelity, and how to help

Each icon declares how close it is to the brand's published mark:

- **`official-geometry`** — geometry matches the official mark.
- **`approximate`** — a hand-authored interpretation in the brand's colours. It looks right in a
  UI at 16–32px, but it is not the brand's own file.

Most DEX marks are currently `approximate`. **If you have the right to contribute an official
asset, that's the single most valuable PR you can send** — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

```bash
npm install
npm run icons        # SVG sources → generated TypeScript
npm run build        # icons + both packages
npm test             # build, then structure + runtime + React tests
npm run check        # lint icons, test, typecheck — what CI runs
npm run dev:site     # docs site on http://localhost:4321
```

The pipeline is one-directional and the generated files are not committed:

```
icons/registry.json  ─┐
icons/<type>/*.svg   ─┴─►  scripts/build-icons.mjs  ─┬─► packages/core/src/generated.ts + ids.ts
                                                     ├─► packages/react/src/generated.tsx
                                                     ├─► build/svg/**  (colour + mono)
                                                     └─► build/icons.json
```

Edit the SVG and the registry entry. Never edit a `generated.*` file.

## Licence

Code and packaging: [MIT](LICENSE).

The logos themselves are trademarks of their respective owners and are **not** covered by the MIT
licence. Read [TRADEMARKS.md](TRADEMARKS.md) before using them — especially the part about not
implying endorsement, and about honouring takedown requests.
