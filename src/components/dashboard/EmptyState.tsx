import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  /** Optional action area — buttons, links. */
  action?: React.ReactNode
  /** Compact (inline list-empty) vs default (full-page-ish). */
  variant?: 'default' | 'compact'
  /** Override the wrapper card; pass false to render without an outer Card. */
  bare?: boolean
  className?: string
}

/**
 * Friendly empty state — used wherever a list/grid has no rows yet.
 *
 * Ships an outer Card by default so it slots straight into a page; pass
 * `bare` to drop the card when the parent already provides one.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  bare = false,
  className,
}: EmptyStateProps) {
  const inner = (
    <div
      className={cn(
        'flex flex-col items-center text-center gap-3',
        variant === 'default' ? 'py-10 px-4' : 'py-6 px-3',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-full bg-surface-low flex items-center justify-center',
            variant === 'default' ? 'w-14 h-14' : 'w-11 h-11',
          )}
        >
          <Icon
            className={cn(
              'text-on-surface/40',
              variant === 'default' ? 'w-7 h-7' : 'w-5 h-5',
            )}
          />
        </div>
      )}
      <p
        className={cn(
          'font-display font-bold text-on-surface',
          variant === 'default' ? 'text-title-lg' : 'text-title-md',
        )}
      >
        {title}
      </p>
      {description && (
        <p className="text-body-md text-on-surface/60 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2 flex flex-wrap gap-2 justify-center">{action}</div>}
    </div>
  )

  if (bare) return inner
  return <Card padding="none">{inner}</Card>
}
