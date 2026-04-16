import { cn } from '@/utils/cn'

type SectionBg = 'default' | 'card' | 'low' | 'primary' | 'dark'

interface SectionProps {
  children: React.ReactNode
  bg?: SectionBg
  className?: string
  id?: string
  noPad?: boolean
}

/**
 * Page section container.
 * Uses surface color shifts (not 1px dividers) to define boundaries.
 *
 * bg variants:
 * - default  → #f9f9f9 (warm gray base)
 * - card     → #ffffff (bright white)
 * - low      → #eeeeee (slightly deeper)
 * - primary  → gradient red (CTA sections)
 * - dark     → #1a1c1c (inverted sections)
 */
export function Section({ children, bg = 'default', className, id, noPad }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        !noPad && 'py-16 md:py-24',
        bg === 'default' && 'bg-surface',
        bg === 'card' && 'bg-surface-card',
        bg === 'low' && 'bg-surface-low',
        bg === 'primary' && 'bg-gradient-primary text-white',
        bg === 'dark' && 'bg-on-surface text-white',
        className
      )}
    >
      {children}
    </section>
  )
}
