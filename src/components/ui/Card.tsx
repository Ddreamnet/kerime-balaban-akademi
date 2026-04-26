import { cn } from '@/utils/cn'

export type CardSurface =
  | 'default'
  | 'warm'
  | 'cool'
  | 'dark'
  | 'spotlight'
  | 'elite'
export type CardElevation = 'flat' | 'sm' | 'md' | 'lg'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /**
   * Background variant:
   *  • default   — white card on warm gray (the standard)
   *  • warm      — soft cream wash, picks up the brand red
   *  • cool      — soft blue wash, complements the secondary palette
   *  • dark      — inverted card with neutral dark surface
   *  • spotlight — primary gradient + white text (CTA hero card)
   *  • elite     — wine gradient + white text (editorial/premium quiet)
   */
  surface?: CardSurface
  /** Shadow depth — defaults to ambient. */
  elevation?: CardElevation
  /** Inline style — useful for one-off gradient backgrounds. */
  style?: React.CSSProperties
}

const SURFACE_CLASSES: Record<CardSurface, string> = {
  default: 'bg-surface-card',
  warm: 'bg-surface-warm',
  cool: 'bg-surface-cool',
  dark: 'bg-surface-dark text-white',
  // Inline gradient via [background-image:...] arbitrary value avoids any
  // tailwind-merge conflict with the default 'bg-surface-card' that would
  // otherwise be passed alongside via className overrides.
  spotlight:
    'text-white [background-image:linear-gradient(135deg,#b7131a_0%,#db322f_100%)]',
  elite:
    'text-white [background-image:linear-gradient(135deg,#3B1E1E_0%,#5c2828_100%)]',
}

const ELEVATION_CLASSES: Record<CardElevation, string> = {
  flat: 'shadow-none',
  sm: 'shadow-ambient-sm',
  md: 'shadow-ambient',
  lg: 'shadow-ambient-md',
}

/**
 * Card — surface block on a warm gray background.
 * Uses ambient shadow instead of border. No 1px dividers.
 *
 * Variants:
 *  • surface     — white / warm / cool / dark
 *  • elevation   — flat / sm / md (default) / lg
 *  • hoverable   — adds lift + shadow growth on hover
 */
export function Card({
  children,
  className,
  hoverable = false,
  onClick,
  padding = 'md',
  surface = 'default',
  elevation = 'md',
  style,
}: CardProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-2xl',
        SURFACE_CLASSES[surface],
        ELEVATION_CLASSES[elevation],
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-5 md:p-6',
        padding === 'lg' && 'p-6 md:p-8',
        hoverable && [
          'transition-all duration-200 cursor-pointer',
          elevation === 'flat'
            ? 'hover:bg-surface-low'
            : 'hover:shadow-ambient-md hover:-translate-y-0.5',
        ],
        onClick && 'w-full text-left focus-visible:outline-2 focus-visible:outline-primary',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
