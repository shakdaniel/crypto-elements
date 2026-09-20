/** Which half of the collection an icon belongs to. */
export type IconType = 'chain' | 'dex'

/**
 * How close the artwork is to the brand's official mark.
 *
 * - `official-geometry` — geometry matches the published brand mark.
 * - `approximate` — hand-authored interpretation in the brand's colours.
 *   Good enough to ship in a UI, but see CONTRIBUTING.md if you have the
 *   rights to contribute the official asset.
 */
export type Fidelity = 'official-geometry' | 'approximate'

export interface IconData {
  /** Stable identifier. Chains are uppercase (`ETH`), DEXes lowercase (`uniswap`). */
  id: string
  type: IconType
  /** Human-readable brand name. */
  name: string
  /** SVG viewBox, always square. */
  viewBox: string
  /** Dominant brand colours, most significant first. */
  colors: string[]
  /** Alternative lookup keys (`ethereum`, `bsc`, `jup`, …). */
  aliases: string[]
  website: string | null
  /** Native asset ticker, where the icon represents a chain. */
  symbol: string | null
  /** EIP-155 chain id, where one exists. */
  evmChainId: number | null
  /** For DEXes: chains the venue is deployed on. */
  chains: string[] | null
  fidelity: Fidelity
  /** Full-colour SVG markup, without the `<svg>` wrapper. */
  body: string
  /** `currentColor` variant of `body`. */
  mono: string
}

export interface RenderOptions {
  /** Width and height. Numbers are treated as pixels. Defaults to `24`. */
  size?: number | string
  /** Render the single-colour variant, inheriting `currentColor`. */
  mono?: boolean
  /** Shorthand for `color:` on the root element. Implies `mono`. */
  color?: string
  /** Accessible name. Omit for decorative icons — they get `aria-hidden`. */
  title?: string
  /** Extra attributes on the root `<svg>`. */
  attrs?: Record<string, string | number>
}
