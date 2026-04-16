import { cn } from '@/utils/cn'

interface SectionHeaderProps {
  label?: string         // Small uppercase label above headline
  headline: string
  highlight?: string     // Portion of headline to render in primary color
  body?: string
  align?: 'left' | 'center'
  inverted?: boolean     // White text for dark/primary backgrounds
  className?: string
  action?: React.ReactNode  // Optional CTA/link aligned with header
}

/**
 * Reusable section header.
 * Uses the editorial scaling pattern: small label → large headline → body text.
 * High-contrast sizing creates a magazine-like layout.
 */
export function SectionHeader({
  label,
  headline,
  highlight,
  body,
  align = 'left',
  inverted = false,
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {/* Row: label + optional action */}
      {(label || action) && (
        <div
          className={cn(
            'flex items-center',
            align === 'center' ? 'justify-center' : 'justify-between',
            'w-full'
          )}
        >
          {label && (
            <span
              className={cn(
                'text-label-md uppercase tracking-widest font-semibold',
                inverted ? 'text-white/60' : 'text-primary'
              )}
            >
              {label}
            </span>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}

      {/* Headline */}
      <h2
        className={cn(
          'font-display text-display-sm md:text-display-md leading-tight',
          inverted ? 'text-white' : 'text-on-surface'
        )}
      >
        {highlight ? (
          <>
            {headline}{' '}
            <span className={inverted ? 'text-white/80 italic' : 'text-gradient-primary'}>
              {highlight}
            </span>
          </>
        ) : (
          headline
        )}
      </h2>

      {/* Body */}
      {body && (
        <p
          className={cn(
            'text-body-lg max-w-xl',
            inverted ? 'text-white/70' : 'text-on-surface/60',
            align === 'center' && 'mx-auto'
          )}
        >
          {body}
        </p>
      )}
    </div>
  )
}
