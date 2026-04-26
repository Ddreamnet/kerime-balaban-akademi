import { cn } from '@/utils/cn'

export interface MetaItem {
  /** Lucide icon. */
  icon: React.ComponentType<{ className?: string }>
  /** Small uppercase label. */
  label: string
  /** Main value. */
  value: React.ReactNode
  /** Smaller secondary line beneath the value. */
  hint?: React.ReactNode
}

interface MetaListProps {
  items: MetaItem[]
  /** Layout — stacked rows (default) or 2-column grid on md+. */
  columns?: 1 | 2
  className?: string
}

/**
 * Icon + label + value vertical list. Used on detail pages (student/coach/parent
 * profile cards) to render metadata without re-implementing the row markup.
 */
export function MetaList({ items, columns = 1, className }: MetaListProps) {
  return (
    <div
      className={cn(
        columns === 2
          ? 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'
          : 'flex flex-col gap-3',
        className,
      )}
    >
      {items.map((item, i) => (
        <MetaRow key={i} item={item} />
      ))}
    </div>
  )
}

function MetaRow({ item }: { item: MetaItem }) {
  const Icon = item.icon
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <p className="text-label-sm text-on-surface/45 uppercase tracking-wider">
          {item.label}
        </p>
        <p className="text-body-md font-semibold text-on-surface break-words">
          {item.value}
        </p>
        {item.hint && (
          <p className="text-body-sm text-on-surface/55 break-words">{item.hint}</p>
        )}
      </div>
    </div>
  )
}
