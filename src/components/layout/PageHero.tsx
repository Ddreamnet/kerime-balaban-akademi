import { cn } from '@/utils/cn'
import { Container } from './Container'

interface PageHeroProps {
  label?: string
  headline: string
  highlight?: string
  body?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Reusable interior page hero — shorter than the home hero.
 * Used on /dersler, /urunler, /iletisim, /hakkimizda, /duyurular.
 */
export function PageHero({
  label,
  headline,
  highlight,
  body,
  className,
  children,
}: PageHeroProps) {
  return (
    <div
      className={cn(
        'relative bg-on-surface overflow-hidden',
        'py-16 md:py-20',
        className
      )}
    >
      {/* Decorative red accent — bleeds off right */}
      <div className="absolute -right-12 top-0 bottom-0 w-1/3 bg-gradient-primary opacity-10 -skew-x-6 pointer-events-none" />
      <div className="absolute -right-4 top-0 bottom-0 w-1/5 bg-gradient-primary opacity-15 -skew-x-6 pointer-events-none" />

      <Container>
        <div className="relative z-10 max-w-2xl">
          {label && (
            <p className="text-label-md text-primary uppercase tracking-widest mb-3">
              {label}
            </p>
          )}
          <h1 className="font-display text-display-sm md:text-display-md text-white leading-tight mb-4">
            {headline}
            {highlight && (
              <>
                {' '}
                <span className="text-gradient-primary">{highlight}</span>
              </>
            )}
          </h1>
          {body && (
            <p className="text-body-lg text-white/65 max-w-xl">{body}</p>
          )}
          {children}
        </div>
      </Container>
    </div>
  )
}
