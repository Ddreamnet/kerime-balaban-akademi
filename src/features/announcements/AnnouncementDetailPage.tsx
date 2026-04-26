import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pin, Share2 } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Spinner } from '@/components/ui/Spinner'
import { SEO } from '@/components/SEO'
import { getPublishedAnnouncement } from '@/lib/announcements'
import {
  announcements as staticAnnouncements,
  announcementCategoryLabels,
  announcementCategoryColors,
} from '@/data/announcements'
import type { Announcement } from '@/types/content.types'
import { formatDateLong } from '@/utils/format'
import { publicUrl, sharePublic } from '@/utils/share'
import { cn } from '@/utils/cn'

export function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [justCopied, setJustCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    void (async () => {
      const fromDb = await getPublishedAnnouncement(id)
      if (cancelled) return
      if (fromDb) {
        setAnnouncement(fromDb)
      } else {
        const fromStatic =
          staticAnnouncements.find((a) => a.id === id && a.is_published) ?? null
        setAnnouncement(fromStatic)
      }
      setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleShare = async () => {
    if (!announcement) return
    const url = publicUrl(`/duyurular/${announcement.id}`)
    const result = await sharePublic({
      title: announcement.title,
      text: announcement.excerpt,
      url,
    })
    if (result === 'copied') {
      setJustCopied(true)
      setTimeout(() => setJustCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface min-h-[60vh] flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="bg-surface py-12 md:py-16">
        <Container>
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 text-center">
            <p className="font-display font-bold text-headline-sm text-on-surface">
              Duyuru bulunamadı
            </p>
            <p className="text-body-md text-on-surface/60">
              Aradığınız duyuru kaldırılmış olabilir.
            </p>
            <Link
              to="/duyurular"
              className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tüm duyurular
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const categoryLabel =
    announcementCategoryLabels[announcement.category] ?? announcement.category
  const categoryColor =
    announcementCategoryColors[announcement.category] ?? 'bg-surface-low text-on-surface'

  return (
    <div className="bg-surface pb-16 md:pb-24">
      <SEO
        title={`${announcement.title} — Duyuru`}
        description={announcement.excerpt.slice(0, 160)}
        path={`/duyurular/${announcement.id}`}
        image={announcement.image_url}
        type="article"
      />
      <Container>
        <article className="max-w-3xl mx-auto">
          {/* Top bar: back link + share */}
          <div className="flex items-center justify-between gap-3 pt-4 md:pt-6 pb-6">
            <Link
              to="/duyurular"
              className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-on-surface/60 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tüm duyurular
            </Link>
            <button
              type="button"
              onClick={handleShare}
              aria-label={justCopied ? 'Link kopyalandı' : 'Duyuruyu paylaş'}
              className={cn(
                'inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                'bg-surface-card shadow-ambient',
                justCopied
                  ? 'text-green-700'
                  : 'text-on-surface/70 hover:text-primary hover:bg-primary/5',
              )}
            >
              {justCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Hero image (if any) */}
          {announcement.image_url && (
            <div className="rounded-2xl overflow-hidden bg-surface-low aspect-[16/9] mb-8 shadow-ambient">
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap mb-4">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5',
                'text-label-sm uppercase tracking-widest font-semibold',
                categoryColor,
              )}
            >
              {categoryLabel}
            </span>
            <span className="text-label-sm text-on-surface/50">
              {formatDateLong(announcement.published_at)}
            </span>
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 text-label-sm text-primary font-semibold">
                <Pin className="w-3 h-3" />
                Öne Çıkan
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-headline-lg md:text-display-sm text-on-surface leading-[1.15] mb-5">
            {announcement.title}
          </h1>

          {/* Lead excerpt */}
          <p className="text-body-lg md:text-title-md text-on-surface/75 leading-relaxed mb-8 font-medium">
            {announcement.excerpt}
          </p>

          {/* Accent divider */}
          <div className="w-12 h-1 rounded-full bg-primary mb-8" />

          {/* Body */}
          <div className="text-body-md md:text-body-lg text-on-surface/85 leading-[1.75] whitespace-pre-line">
            {announcement.content}
          </div>
        </article>
      </Container>
    </div>
  )
}
