import { useMemo, useState } from 'react'
import { Images } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { PerformanceRecord } from '@/lib/performance'
import { formatDateLong } from '@/utils/format'
import { PhotoLightbox, type LightboxPhoto } from './PhotoLightbox'

interface Props {
  records: PerformanceRecord[]
  isLoading?: boolean
  emptyHint?: string
}

interface FlatPhoto {
  url: string
  caption: string | null
  recorded_at: string
  record_summary: string | null
}

function summary(record: PerformanceRecord): string | null {
  const parts: string[] = []
  if (record.height_cm !== null) parts.push(`Boy ${record.height_cm} cm`)
  if (record.weight_kg !== null) parts.push(`Kilo ${record.weight_kg} kg`)
  if (record.split_cm !== null) parts.push(`Kerme ${record.split_cm} cm`)
  return parts.length ? parts.join(' · ') : null
}

export function PerformancePhotoGallery({ records, isLoading, emptyHint }: Props) {
  const photos = useMemo<FlatPhoto[]>(() => {
    // Records come newest-first; preserve that order for the flat gallery.
    return records.flatMap((r) =>
      r.photos.map((p) => ({
        url: p.url,
        caption: p.caption,
        recorded_at: r.recorded_at,
        record_summary: summary(r),
      })),
    )
  }, [records])

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
          <Images className="w-7 h-7 text-on-surface/40" />
        </div>
        <p className="font-display font-bold text-title-lg text-on-surface">
          Henüz fotoğraf yok
        </p>
        <p className="text-body-md text-on-surface/60 max-w-sm">
          {emptyHint ?? 'Antrenör ölçümlerine fotoğraf eklediğinde burada görünecek.'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {photos.map((p, i) => (
          <button
            key={`${p.url}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-square rounded-lg overflow-hidden bg-surface-low"
            aria-label={`Fotoğrafı büyüt — ${formatDateLong(p.recorded_at)}`}
          >
            <img
              src={p.url}
              alt={p.caption ?? ''}
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-on-surface/75 via-on-surface/30 to-transparent px-2.5 py-2 text-left">
              <span className="block text-label-sm font-semibold text-white tabular-nums">
                {formatDateLong(p.recorded_at)}
              </span>
              {p.caption && (
                <span className="block text-body-sm text-white/90 line-clamp-1">
                  {p.caption}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos.map<LightboxPhoto>((p) => ({
            url: p.url,
            caption: p.caption,
            subtitle:
              formatDateLong(p.recorded_at) +
              (p.record_summary ? ` · ${p.record_summary}` : ''),
          }))}
          startIndex={lightboxIndex}
          isOpen
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
