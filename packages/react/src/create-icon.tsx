import { createElement, forwardRef } from 'react'
import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from 'react'
import type { IconData } from '@shakdaniel/core'

export interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  /** Width and height. Numbers are pixels. Defaults to `24`. */
  size?: number | string
  /** Render the single-colour variant, inheriting `currentColor`. */
  mono?: boolean
  /** Accessible name. Without it the icon is marked `aria-hidden`. */
  title?: string
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>> & {
  /** The underlying icon record, for metadata lookups. */
  icon: IconData
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Wrap an icon record in a memo-friendly React component. */
export function createIcon(icon: IconData): IconComponent {
  const Component = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 24, mono = false, title, ...rest },
    ref,
  ) {
    const markup = mono ? icon.mono : icon.body
    const html = title ? `<title>${escapeXml(title)}</title>${markup}` : markup

    return createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon.viewBox,
      width: size,
      height: size,
      fill: mono ? 'currentColor' : undefined,
      role: title ? 'img' : undefined,
      'aria-hidden': title ? undefined : true,
      focusable: false,
      ...rest,
      // Markup is generated at build time from the repo's own SVG sources.
      dangerouslySetInnerHTML: { __html: html },
    })
  }) as IconComponent

  Component.displayName = `${icon.name.replace(/[^A-Za-z0-9]/g, '')}Icon`
  Component.icon = icon
  return Component
}
