import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * Card — white (#fff) surface on warm gray (#f9f9f9) background.
 * Uses ambient shadow instead of border. No 1px dividers.
 */
export function Card({
  children,
  className,
  hoverable = false,
  onClick,
  padding = 'md',
}: CardProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-surface-card rounded-lg shadow-ambient',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-5 md:p-6',
        padding === 'lg' && 'p-6 md:p-8',
        hoverable && [
          'transition-all duration-200 cursor-pointer',
          'hover:shadow-ambient-md hover:-translate-y-0.5',
        ],
        onClick && 'w-full text-left focus-visible:outline-2 focus-visible:outline-primary',
        className
      )}
    >
      {children}
    </Tag>
  )
}
