import { cn } from '@/utils/cn'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

/**
 * Pill-shaped status badge — design system "Rank System" spec.
 * label-md uppercase with tracking for premium badge feel.
 */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-label-sm uppercase tracking-[0.05em] font-semibold',
        'whitespace-nowrap',

        variant === 'default' && 'bg-surface-low text-on-surface/70',
        variant === 'primary' && 'bg-primary-container text-primary-on-container',
        variant === 'secondary' && 'bg-secondary-container text-secondary-on-container',
        variant === 'success' && 'bg-green-100 text-green-800',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800',
        variant === 'error' && 'bg-red-100 text-primary',

        className
      )}
    >
      {children}
    </span>
  )
}
