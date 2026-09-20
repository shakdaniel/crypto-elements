import type { IconData, IconType, RenderOptions } from './types'
import { chainIcons, dexIcons } from './generated'
import type { ChainId, DexId, IconId } from './ids'

export * from './generated'
export * from './ids'
export type { IconData, IconType, Fidelity, RenderOptions } from './types'
export { chainIcons, dexIcons }

/** Every icon in the collection, chains first. */
export const icons: IconData[] = [...Object.values(chainIcons), ...Object.values(dexIcons)]

const index = new Map<string, IconData>()
// Exact ids win over aliases for un-typed lookups, so `getIcon('hyperliquid')`
// resolves to the venue while `getChainIcon('hyperliquid')` resolves to HyperEVM.
for (const icon of icons) {
  index.set(`${icon.type}:${icon.id.toLowerCase()}`, icon)
  index.set(icon.id.toLowerCase(), icon)
}
for (const icon of icons) {
  for (const alias of icon.aliases) {
    const k = alias.toLowerCase()
    index.set(`${icon.type}:${k}`, icon)
    if (!index.has(k)) index.set(k, icon)
  }
}

/**
 * Look up an icon by id or alias, case-insensitively.
 *
 * ```ts
 * getIcon('ETH')        // Ethereum
 * getIcon('bsc')        // BNB Chain
 * getIcon('hyperliquid', 'dex')  // the DEX, not the chain
 * ```
 */
export function getIcon(id: string, type?: IconType): IconData | undefined {
  if (!id) return undefined
  const key = id.toLowerCase()
  return type ? index.get(`${type}:${key}`) : index.get(key)
}

export const getChainIcon = (id: ChainId | string): IconData | undefined => getIcon(id, 'chain')
export const getDexIcon = (id: DexId | string): IconData | undefined => getIcon(id, 'dex')

/** Resolve an EIP-155 chain id to its icon. */
export function getIconByChainId(chainId: number): IconData | undefined {
  return icons.find((i) => i.evmChainId === chainId)
}

export function hasIcon(id: string, type?: IconType): boolean {
  return getIcon(id, type) !== undefined
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function resolve(icon: IconData | IconId | string): IconData {
  if (typeof icon !== 'string') return icon
  const found = getIcon(icon)
  if (!found) throw new Error(`[crypto-elements] unknown icon: "${icon}"`)
  return found
}

/** Render an icon to a standalone SVG string. */
export function toSvg(icon: IconData | IconId | string, options: RenderOptions = {}): string {
  const data = resolve(icon)
  const { size = 24, mono = false, color, title, attrs = {} } = options
  const useMono = mono || color !== undefined

  const base: Record<string, string | number> = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: data.viewBox,
    width: size,
    height: size,
    fill: useMono ? 'currentColor' : 'none',
  }
  if (!useMono) delete base.fill
  if (color) base.style = `color:${color}`
  if (title) base.role = 'img'
  else base['aria-hidden'] = 'true'

  const merged = { ...base, ...attrs }
  const attrString = Object.entries(merged)
    .map(([k, v]) => ` ${k}="${escapeXml(String(v))}"`)
    .join('')
  const label = title ? `<title>${escapeXml(title)}</title>` : ''

  return `<svg${attrString}>${label}${useMono ? data.mono : data.body}</svg>`
}

/**
 * Render an icon to a `data:` URI, ready for `src` or `background-image`.
 * URL-encoded rather than base64 — smaller, and readable in devtools.
 */
export function toDataUri(icon: IconData | IconId | string, options: RenderOptions = {}): string {
  const svg = toSvg(icon, options)
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/%20/g, ' ').replace(/'/g, '%27')}`
}

/** Search icons by id, name or alias. Returns every icon for an empty query. */
export function searchIcons(query: string, type?: IconType): IconData[] {
  const q = query.trim().toLowerCase()
  const pool = type ? icons.filter((i) => i.type === type) : icons
  if (!q) return pool
  return pool.filter(
    (i) =>
      i.id.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.aliases.some((a) => a.includes(q)),
  )
}
