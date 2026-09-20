import { createElement, forwardRef } from 'react'
import { getIcon } from '@shakdaniel/core'
import type { ChainId, DexId, IconId, IconType } from '@shakdaniel/core'
import { createIcon } from './create-icon'
import type { IconProps } from './create-icon'

const cache = new Map<string, ReturnType<typeof createIcon>>()

function useResolved(id: string, type?: IconType) {
  const key = `${type ?? ''}:${id}`
  let component = cache.get(key)
  if (!component) {
    const data = getIcon(id, type)
    if (!data) return null
    component = createIcon(data)
    cache.set(key, component)
  }
  return component
}

export interface CryptoIconProps extends IconProps {
  /** Icon id or alias — `'uniswap'`, `'ETH'`, `'bsc'`, `'jup'`. */
  id: IconId | (string & {})
  /** Disambiguate ids shared by a chain and a venue (e.g. Hyperliquid). */
  type?: IconType
  /** Rendered when the id is unknown. Defaults to `null`. */
  fallback?: React.ReactNode
}

/**
 * Renders any icon by id. Pulls the whole collection into your bundle —
 * import the named components (`<UniswapIcon />`) when you want tree-shaking.
 */
export const CryptoIcon = forwardRef<SVGSVGElement, CryptoIconProps>(function CryptoIcon(
  { id, type, fallback = null, ...rest },
  ref,
) {
  const Component = useResolved(id, type)
  if (!Component) return fallback as React.ReactElement | null
  return createElement(Component, { ...rest, ref })
})

export interface ChainIconProps extends Omit<CryptoIconProps, 'id' | 'type'> {
  id: ChainId | (string & {})
}
export const ChainIcon = forwardRef<SVGSVGElement, ChainIconProps>(function ChainIcon(props, ref) {
  return createElement(CryptoIcon, { ...props, type: 'chain', ref })
})

export interface DexIconProps extends Omit<CryptoIconProps, 'id' | 'type'> {
  id: DexId | (string & {})
}
export const DexIcon = forwardRef<SVGSVGElement, DexIconProps>(function DexIcon(props, ref) {
  return createElement(CryptoIcon, { ...props, type: 'dex', ref })
})
