import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { AnnouncementCard } from '@/features/announcements/AnnouncementCard'
import { announcements as staticAnnouncements } from '@/data/announcements'
import { listPublishedAnnouncements } from '@/lib/announcements'
import type { Announcement } from '@/types/content.types'

export function AnnouncementsSection() {
  const [items, setItems] = useState<Announcement[]>([])

  useEffect(() => {
    const load = async () => {
      const fromDb = await listPublishedAnnouncements()
      // Graceful fallback to static data if DB is empty (e.g., first run before admin posts)
      if (fromDb.length > 0) {
        setItems(fromDb.slice(0, 3))
      } else {
        const sorted = [...staticAnnouncements]
          .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1
            if (!a.is_pinned && b.is_pinned) return 1
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          })
          .slice(0, 3)
        setItems(sorted)
      }
    }
    void load()
  }, [])

  if (items.length === 0) return null

  return (
    <Section bg="low">
      <Container>
        <div className="flex flex-col gap-10">
          <SectionHeader
            label="Son Duyurular"
            headline="Akademiden"
            highlight="haberler."
            body="Kuşak sınavları, etkinlikler ve duyurular için burayı takip edin."
            action={
              <Link
                to="/duyurular"
                className="hidden md:flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Tüm duyurular
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((ann) => (
              <AnnouncementCard key={ann.id} announcement={ann} />
            ))}
          </div>

          <div className="flex justify-center md:hidden">
            <Link
              to="/duyurular"
              className="flex items-center gap-2 text-body-md font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Tüm duyuruları gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
