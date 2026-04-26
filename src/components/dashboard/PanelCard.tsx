import { Card, type CardSurface } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

export type PanelCardTone =
  | 'plain'
  | 'accent'
  | 'warm'
  | 'cool'
  | 'spotlight'
  | 'elite'

interface PanelCardProps {
  /**
   * Visual tone:
   *  • plain     — white surface (default)
   *  • accent    — soft red wash (subtle hero accent)
   *  • warm      — soft pink/cream wash (calm)
   *  • cool      — soft blue wash (informational)
   *  • spotlight — full primary gradient, white text (CTA hero)
   *  • elite     — deep wine gradient, white text (editorial / "premium quiet")
   */
  tone?: PanelCardTone
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  /** Adds the diagonal red accent bands behind content. */
  decorated?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

/**
 * Variant wrapper around the base `Card`. Centralises tone + decoration so the
 * panel pages don't sprinkle gradient classes across hundreds of call sites.
 */
export function PanelCard({
  tone = 'plain',
  padding = 'md',
  hoverable,
  decorated = false,
  className,
  children,
  onClick,
}: PanelCardProps) {
  /**
   * Map tone → Card surface + extra accent classes.
   *
   * Background colors live on Card's `surface` prop (single source of truth) so
   * tailwind-merge can't accidentally drop one when stacked with another bg
   * class via className. PanelCard then layers tone-specific extras (shadow,
   * descendant text color) on top via className.
   */
  const surface: CardSurface | undefined = ({
    plain: undefined,
    accent: undefined,
    warm: 'warm',
    cool: 'cool',
    spotlight: 'spotlight',
    elite: 'elite',
  } as Record<PanelCardTone, CardSurface | undefined>)[tone]

  const toneAccent = {
    plain: '',
    accent: 'panel-accent-bg',
    warm: '',
    cool: '',
    spotlight: 'shadow-primary-glow/30 [&_p]:text-white/90',
    elite: 'shadow-wine-glow/40 [&_p]:text-white/85',
  }[tone]

  return (
    <Card
      hoverable={hoverable}
      padding={decorated ? 'none' : padding}
      onClick={onClick}
      surface={surface}
      className={cn(
        'relative',
        toneAccent,
        decorated && 'overflow-hidden',
        className,
      )}
    >
      {decorated && (
        <>
          <div
            className={cn(
              'panel-band right-[-2rem]',
              (tone === 'spotlight' || tone === 'elite') && 'opacity-15',
            )}
            aria-hidden="true"
          />
          <div
            className={cn(
              'panel-band panel-band-2 right-[-1rem]',
              (tone === 'spotlight' || tone === 'elite') && 'opacity-25',
            )}
            aria-hidden="true"
          />
        </>
      )}
      <div
        className={cn(
          'relative z-10',
          decorated && padding === 'md' && 'p-5 md:p-6',
          decorated && padding === 'sm' && 'p-4',
          decorated && padding === 'lg' && 'p-6 md:p-8',
        )}
      >
        {children}
      </div>
    </Card>
  )
}
