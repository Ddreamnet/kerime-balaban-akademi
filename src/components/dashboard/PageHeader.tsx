import { cn } from '@/utils/cn'

interface PageHeaderProps {
  /** Small uppercase kicker — usually the panel name ("Yönetici Paneli" / "Veli Paneli"). */
  kicker?: string
  /** Main page title. */
  title: string
  /** Optional emoji/icon decoration appended after the title (e.g. "👋"). */
  titleAccent?: React.ReactNode
  /** One-line description shown beneath the title. */
  description?: string
  /** Right-aligned action slot — buttons, badges, links. */
  action?: React.ReactNode
  /** Adds the diagonal red accent bands seen on the public hero. Default false. */
  decorated?: boolean
  className?: string
}

/**
 * Consistent header for every panel page (admin/coach/parent).
 *
 * Replaces the hand-rolled "kicker + h1 + tagline" trio sprinkled across
 * 19+ pages. Keeps margin/typography in one place so a future tweak
 * propagates everywhere.
 */
export function PageHeader({
  kicker,
  title,
  titleAccent,
  description,
  action,
  decorated = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        decorated &&
          'overflow-hidden rounded-2xl bg-surface-card px-5 py-5 pl-7 shadow-ambient',
        className,
      )}
    >
      {decorated && (
        <>
          {/* Editorial wine rail on the left — anchors the title with a deeper accent */}
          <div className="panel-wine-rail" aria-hidden="true" />
          {/* Diagonal red bands on the right — same DNA as the public hero */}
          <div className="panel-band right-[-2rem]" aria-hidden="true" />
          <div className="panel-band panel-band-2 right-[-1rem]" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 flex flex-col gap-1 min-w-0">
        {kicker && <p className="panel-kicker">{kicker}</p>}
        <h1 className="font-display text-headline-lg text-on-surface flex flex-wrap items-baseline gap-2">
          <span>{title}</span>
          {titleAccent}
        </h1>
        {description && (
          <p className="text-body-md text-on-surface/60 mt-0.5 max-w-2xl">{description}</p>
        )}
      </div>

      {action && <div className="relative z-10 shrink-0 flex flex-wrap gap-2">{action}</div>}
    </header>
  )
}
