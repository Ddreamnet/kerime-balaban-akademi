import { useEffect, useState } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Spinner } from '@/components/ui/Spinner'
import { SEO } from '@/components/SEO'
import { AnnouncementCard } from './AnnouncementCard'
import {
  announcements as staticAnnouncements,
  announcementCategoryLabels,
} from '@/data/announcements'
import { listPublishedAnnouncements } from '@/lib/announcements'
import type { Announcement, AnnouncementCategory } from '@/types/content.types'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { cn } from '@/utils/cn'

type FilterKey = 'all' | AnnouncementCategory

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'sinav', label: announcementCategoryLabels['sinav'] },
  { key: 'etkinlik', label: announcementCategoryLabels['etkinlik'] },
  { key: 'duyuru', label: announcementCategoryLabels['duyuru'] },
  { key: 'tatil', label: announcementCategoryLabels['tatil'] },
]

export function AnnouncementsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [all, setAll] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const settings = useSiteSettings()

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const fromDb = await listPublishedAnnouncements()
      // Graceful fallback to static if DB empty
      setAll(fromDb.length > 0 ? fromDb : [...staticAnnouncements].filter((a) => a.is_published))
      setIsLoading(false)
    }
    void load()
  }, [])

  const sorted = [...all].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  })

  const visible = sorted.filter(
    (a) => activeFilter === 'all' || a.category === activeFilter,
  )

  return (
    <>
      <SEO
        title="Duyurular — Kerime Balaban Taekwondo Akademisi"
        description="Kerime Balaban Akademi duyuruları: kuşak sınavları, müsabaka sonuçları, etkinlikler ve akademi haberleri. Bartın taekwondo camiasının güncel bilgileri."
        path="/duyurular"
      />
      <PageHero
        label={settings.announcements_hero_label}
        headline={settings.announcements_hero_headline}
        highlight={settings.announcements_hero_highlight}
        body={settings.announcements_hero_body}
      />

      <Section bg="default">
        <Container>
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-2">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-body-sm font-semibold transition-all duration-150',
                    'focus-visible:outline-2 focus-visible:outline-primary',
                    activeFilter === key
                      ? 'bg-primary text-white shadow-primary-glow/20'
                      : 'bg-surface-card text-on-surface/60 hover:bg-surface-low hover:text-on-surface shadow-ambient',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : activeFilter === 'all' && sorted.some((a) => a.is_pinned) ? (
              <>
                <div className="flex flex-col gap-4">
                  <p className="text-label-md text-primary uppercase tracking-widest font-semibold">
                    Öne Çıkan
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sorted
                      .filter((a) => a.is_pinned)
                      .map((ann) => (
                        <AnnouncementCard key={ann.id} announcement={ann} variant="featured" />
                      ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-label-md text-on-surface/40 uppercase tracking-widest">
                    Tüm Duyurular
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visible
                      .filter((a) => !a.is_pinned)
                      .map((ann) => (
                        <AnnouncementCard key={ann.id} announcement={ann} />
                      ))}
                  </div>
                </div>
              </>
            ) : visible.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visible.map((ann) => (
                  <AnnouncementCard key={ann.id} announcement={ann} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-body-lg text-on-surface/40">
                  Bu kategoride duyuru bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
