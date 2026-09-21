# @crypto-elements/react

React components for crypto chain and DEX logos. One component per icon, tree-shakeable, typed, SSR-safe.

```bash
npm i @crypto-elements/react
```

**[Browse all icons →](https://shakdaniel.github.io/crypto-elements)** · Not using React? See [`@crypto-elements/core`](https://www.npmjs.com/package/@crypto-elements/core).

## Use

```tsx
import { UniswapIcon, EthIcon, SolIcon } from '@crypto-elements/react'

<UniswapIcon />                                  // 24px, full colour, aria-hidden
<EthIcon size={32} title="Ethereum" />           // announced to screen readers
<SolIcon size={16} mono className="text-zinc-400" />  // inherits currentColor
```

Every other prop goes to the root `<svg>` — `className`, `style`, `onClick`, `data-*`, `ref`.

## Dynamic ids

When the icon comes from data — an API response, a route, a config file:

```tsx
import { CryptoIcon, ChainIcon, DexIcon } from '@crypto-elements/react'

<ChainIcon id={route.chain} size={20} />
<DexIcon id="jup" />                              // aliases work
<CryptoIcon id={token.venue} fallback={<span>?</span>} />
```

An unknown id renders `fallback` (default `null`) rather than throwing.

These resolve at runtime, so they include every icon in your bundle. Prefer the named components when you know the icon at build time.

## Props

| Prop | Type | Default | |
|---|---|---|---|
| `size` | `number \| string` | `24` | width and height |
| `mono` | `boolean` | `false` | single-colour variant using `currentColor` |
| `title` | `string` | — | accessible name; without it the icon is `aria-hidden` |
| `id` | `IconId` | — | `CryptoIcon` / `ChainIcon` / `DexIcon` only |
| `fallback` | `ReactNode` | `null` | rendered for unknown ids |

## Metadata

Each component exposes its icon record:

```tsx
UniswapIcon.icon.colors    // ["#FF007A"]
BaseIcon.icon.evmChainId   // 8453
```

## Licence

MIT for the code. The logos are trademarks of their owners and are not covered by the MIT licence — see [TRADEMARKS.md](https://github.com/shakdaniel/crypto-elements/blob/main/TRADEMARKS.md).
