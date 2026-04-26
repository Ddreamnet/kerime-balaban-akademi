import { cn } from '@/utils/cn'

interface SectionTitleProps {
  /** Main heading text. */
  title: string
  /** Optional subtitle / count line. */
  subtitle?: string
  /** Right-side action area (link, button, badge). */
  action?: React.ReactNode
  /** Visual size — `lg` for top-of-section, `md` (default) for inner groups. */
  size?: 'md' | 'lg'
  /** Heading level. Defaults to h2. */
  as?: 'h2' | 'h3'
  className?: string
  id?: string
}

/**
 * In-page section heading — sits above grids, lists, or grouped cards inside
 * a panel page. Differs from `PageHeader` (which is for the whole page).
 */
export function SectionTitle({
  title,
  subtitle,
  action,
  size = 'md',
  as: Tag = 'h2',
  className,
  id,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex items-end justify-between gap-3 flex-wrap',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <Tag
          id={id}
          className={cn(
            'font-display font-semibold text-on-surface leading-tight',
            size === 'lg' ? 'text-headline-md' : 'text-title-lg',
          )}
        >
          {title}
        </Tag>
        {subtitle && (
          <p className="text-body-sm text-on-surface/55 truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  )
}
