import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface LightboxPhoto {
  url: string
  caption: string | null
  /** Optional secondary line, e.g. formatted date. */
  subtitle?: string | null
}

interface Props {
  photos: LightboxPhoto[]
  startIndex: number
  isOpen: boolean
  onClose: () => void
}

/**
 * Fullscreen photo viewer with prev/next navigation.
 * Arrow keys and swipe gestures navigate. Esc closes.
 */
export function PhotoLightbox({ photos, startIndex, isOpen, onClose }: Props) {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    if (isOpen) setIndex(startIndex)
  }, [isOpen, startIndex])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(photos.length - 1, i + 1))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, photos.length])

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      if (diff > 0) setIndex((i) => Math.max(0, i - 1))
      else setIndex((i) => Math.min(photos.length - 1, i + 1))
    }
    setTouchStart(null)
  }

  if (!isOpen || photos.length === 0) return null

  const photo = photos[index]
  if (!photo) return null

  const hasPrev = index > 0
  const hasNext = index < photos.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğraf görüntüleyici"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <span className="text-body-sm tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image + nav */}
      <div className="flex-1 flex items-center justify-center relative px-2 min-h-0">
        {hasPrev && (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Önceki"
            className={cn(
              'absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10',
              'p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors',
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.caption ?? ''}
          className="max-h-full max-w-full object-contain select-none"
          draggable={false}
        />

        {hasNext && (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Sonraki"
            className={cn(
              'absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10',
              'p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors',
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption */}
      {(photo.caption || photo.subtitle) && (
        <div className="px-5 py-4 text-center text-white/90 flex flex-col gap-1 max-w-2xl mx-auto">
          {photo.caption && <p className="text-body-md">{photo.caption}</p>}
          {photo.subtitle && (
            <p className="text-body-sm text-white/60">{photo.subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}
