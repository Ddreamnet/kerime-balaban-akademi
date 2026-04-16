import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import type { Announcement } from '@/types/content.types'
import { announcementCategoryLabels, announcementCategoryColors } from '@/data/announcements'
import { formatDateLong } from '@/utils/format'

interface AnnouncementCardProps {
  announcement: Announcement
  variant?: 'default' | 'featured'
}

export function AnnouncementCard({
  announcement,
  variant = 'default',
}: AnnouncementCardProps) {
  const colorClass =
    announcementCategoryColors[announcement.category] ??
    'bg-surface-low text-on-surface'

  return (
    <Card
      className={cn(
        'flex flex-col gap-3',
        announcement.is_pinned && 'ring-1 ring-primary/20',
        variant === 'featured' && 'p-6 md:p-8'
      )}
      hoverable
    >
      {/* Top: category + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5',
            'text-label-sm uppercase tracking-widest font-semibold',
            colorClass
          )}
        >
          {announcementCategoryLabels[announcement.category] ?? announcement.category}
        </span>
        <span className="text-label-sm text-on-surface/40">
          {formatDateLong(announcement.published_at)}
        </span>
      </div>

      {/* Pinned indicator */}
      {announcement.is_pinned && (
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span className="text-label-sm text-primary font-semibold">Öne Çıkan</span>
        </div>
      )}

      {/* Title */}
      <h3 className="font-display text-headline-sm text-on-surface leading-tight">
        {announcement.title}
      </h3>

      {/* Excerpt */}
      <p className="text-body-md text-on-surface/60 leading-relaxed line-clamp-3">
        {announcement.excerpt}
      </p>

      {/* Read more */}
      <button
        className="flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors mt-auto pt-1 w-fit"
        onClick={() => {/* Future: navigate to announcement detail page */}}
      >
        Devamını oku
        <ChevronRight className="w-4 h-4" />
      </button>
    </Card>
  )
}
