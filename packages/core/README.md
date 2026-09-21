# @crypto-elements/core

SVG logos for crypto chains and DEXes, as plain data. No dependencies, no framework, no DOM required — works in the browser, Node, edge runtimes and build scripts.

```bash
npm i @crypto-elements/core
```

**[Browse all icons →](https://shakdaniel.github.io/crypto-elements)** · Using React? See [`@crypto-elements/react`](https://www.npmjs.com/package/@crypto-elements/react).

## Render

```ts
import { toSvg, toDataUri } from '@crypto-elements/core'

el.innerHTML = toSvg('uniswap', { size: 32 })
el.innerHTML = toSvg('ETH', { size: 20, title: 'Ethereum' })   // accessible: role="img" + <title>
el.innerHTML = toSvg('ARB', { size: 16, mono: true })          // inherits currentColor
el.innerHTML = toSvg('SOL', { color: '#64748b' })              // mono, tinted

el.style.backgroundImage = `url("${toDataUri('BASE', { size: 20 })}")`
img.src = toDataUri('pumpfun')
```

Without a `title`, icons are marked `aria-hidden` — correct for icons beside a visible label.

## Look up

```ts
import { getIcon, getChainIcon, getDexIcon, getIconByChainId, searchIcons } from '@crypto-elements/core'

getIcon('bsc')?.name            // "BNB Chain"   — ids and aliases, case-insensitive
getIcon('JUP')?.id              // "jupiter"
getIconByChainId(8453)?.id      // "BASE"        — EIP-155 chain ids
getChainIcon('hyperliquid')?.id // "HYPE"        — the chain…
getDexIcon('hyperliquid')?.id   // "hyperliquid" — …or the venue
searchIcons('pump')             // [PumpSwap, Pump.fun]
```

## Metadata

Every icon carries data you can build UI from:

```ts
import { base } from '@crypto-elements/core'

base.name        // "Base"
base.colors      // ["#0052FF"]
base.evmChainId  // 8453
base.symbol      // "ETH"
base.aliases     // ["base-mainnet"]
base.fidelity    // "official-geometry" | "approximate"
```

DEX entries also list `chains`, so you can filter venues by the chain a user is on.

## Tree-shaking

Import icons by name and bundlers keep only those:

```ts
import { toSvg, uniswap, eth } from '@crypto-elements/core'
toSvg(uniswap)
```

`getIcon`, `searchIcons` and the `icons` / `chainIcons` / `dexIcons` collections reference the full set.

## Types

```ts
import type { ChainId, DexId, IconId, IconData, RenderOptions } from '@crypto-elements/core'

const chain: ChainId = 'BASE'   // 'ETH' | 'SOL' | 'BASE' | 'BNB' | 'ARB' | 'OP' | 'MATIC' | 'AVAX' | 'HYPE' | 'WETH'
const dex: DexId = 'uniswap'    // 'uniswap' | 'pancakeswap' | 'aerodrome' | … | '1inch'
```

## Licence

MIT for the code. The logos are trademarks of their owners and are not covered by the MIT licence — see [TRADEMARKS.md](https://github.com/shakdaniel/crypto-elements/blob/main/TRADEMARKS.md).
