import { useMemo, useState } from 'react'
import { Activity, Pencil, Plus, Ruler, Sparkles, Trash2, UserCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { PerformancePhoto, PerformanceRecord } from '@/lib/performance'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'
import { PhotoLightbox, type LightboxPhoto } from './PhotoLightbox'

interface Props {
  records: PerformanceRecord[]
  onAdd?: () => void
  onEdit?: (record: PerformanceRecord) => void
  onDelete?: (id: string) => void
  /** Headline above the timeline (default: "Performans Kayıtları") */
  title?: string
  /** Copy for empty state tail line; shown under the primary empty message */
  emptyHint?: string
  isLoading?: boolean
}

export function PerformanceTimeline({
  records,
  onAdd,
  onEdit,
  onDelete,
  title = 'Performans Kayıtları',
  emptyHint,
  isLoading,
}: Props) {
  // Records are already sorted newest-first. Previous (older) record is at i+1.
  const pairs = useMemo(
    () => records.map((r, i) => ({ record: r, previous: records[i + 1] ?? null })),
    [records],
  )

  const isEditable = !!(onAdd || onEdit || onDelete)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display font-bold text-headline-sm text-on-surface">{title}</h2>
          <p className="text-body-sm text-on-surface/50">
            {records.length} kayıt
          </p>
        </div>
        {onAdd && (
          <Button variant="primary" size="md" onClick={onAdd}>
            <Plus className="w-4 h-4" />
            Yeni Kayıt
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Activity className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz kayıt yok
          </p>
          <p className="text-body-md text-on-surface/60 max-w-sm">
            {emptyHint ??
              (isEditable
                ? 'İlk ölçümü eklemek için üstteki butonu kullanın.'
                : 'Antrenörünüz ölçüm eklediğinde burada görünecek.')}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {pairs.map(({ record, previous }) => (
            <RecordCard
              key={record.id}
              record={record}
              previous={previous}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface CardProps {
  record: PerformanceRecord
  previous: PerformanceRecord | null
  onEdit?: (record: PerformanceRecord) => void
  onDelete?: (id: string) => void
}

function RecordCard({ record, previous, onEdit, onDelete }: CardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    setIsDeleting(true)
    await onDelete(record.id)
    // Parent clears it from list; if we stay, reset flag
    setIsDeleting(false)
  }

  const measurements = [
    { key: 'height_cm', label: 'Boy', unit: 'cm', value: record.height_cm, prev: previous?.height_cm ?? null },
    { key: 'weight_kg', label: 'Kilo', unit: 'kg', value: record.weight_kg, prev: previous?.weight_kg ?? null },
    { key: 'split_cm', label: 'Kerme', unit: 'cm', value: record.split_cm, prev: previous?.split_cm ?? null },
    { key: 'forward_reach_cm', label: 'Uzanma', unit: 'cm', value: record.forward_reach_cm, prev: previous?.forward_reach_cm ?? null },
    { key: 'jump_cm', label: 'Sıçrama', unit: 'cm', value: record.jump_cm, prev: previous?.jump_cm ?? null },
  ].filter((m) => m.value !== null)

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <p className="font-display font-semibold text-title-md text-on-surface">
            {formatDateLong(record.recorded_at)}
          </p>
          {record.recorded_by_name && (
            <p className="flex items-center gap-1.5 text-body-sm text-on-surface/50">
              <UserCircle className="w-3.5 h-3.5" />
              {record.recorded_by_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {record.exam_ready && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-container text-primary-on-container px-2.5 py-0.5 text-label-sm font-semibold">
              <Sparkles className="w-3 h-3" />
              Hazır
            </span>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(record)}
              aria-label="Düzenle"
              className="p-1.5 rounded-md text-on-surface/50 hover:text-on-surface hover:bg-surface-low transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Sil"
              className="p-1.5 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Spinner size="sm" color="inherit" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Measurements */}
      {measurements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {measurements.map((m) => (
            <MeasurementChip
              key={m.key}
              label={m.label}
              unit={m.unit}
              value={m.value as number}
              previous={m.prev}
            />
          ))}
        </div>
      )}

      {/* Technique + general notes */}
      {(record.technique_notes || record.general_note) && (
        <div className="flex flex-col gap-3">
          {record.technique_notes && (
            <NoteBlock label="Teknik" body={record.technique_notes} />
          )}
          {record.general_note && (
            <NoteBlock label="Not" body={record.general_note} />
          )}
        </div>
      )}

      {/* Photos */}
      {record.photos.length > 0 && (
        <PhotoGrid
          photos={record.photos}
          recordDateLabel={formatDateLong(record.recorded_at)}
          onOpen={(i) => setLightboxIndex(i)}
        />
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={record.photos.map<LightboxPhoto>((p) => ({
            url: p.url,
            caption: p.caption,
            subtitle: formatDateLong(record.recorded_at),
          }))}
          startIndex={lightboxIndex}
          isOpen
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </Card>
  )
}

function PhotoGrid({
  photos,
  recordDateLabel,
  onOpen,
}: {
  photos: PerformancePhoto[]
  recordDateLabel: string
  onOpen: (index: number) => void
}) {
  const maxVisible = 4
  const visible = photos.slice(0, maxVisible)
  const extra = photos.length - maxVisible

  // Layout: 1 → full; 2 → 2-col; 3 → 1 large + 2 stacked; 4+ → 2x2
  const layoutClass = (() => {
    if (photos.length === 1) return 'grid-cols-1'
    if (photos.length === 2) return 'grid-cols-2'
    return 'grid-cols-2'
  })()

  return (
    <div className={cn('grid gap-1.5 rounded-xl overflow-hidden', layoutClass)}>
      {visible.map((p, i) => {
        const showOverlay = i === maxVisible - 1 && extra > 0
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(i)}
            className={cn(
              'relative bg-surface-low overflow-hidden group',
              photos.length === 1 ? 'aspect-[16/10]' : 'aspect-square',
              photos.length === 3 && i === 0 && 'row-span-2 aspect-auto',
            )}
            aria-label={`Fotoğrafı büyüt — ${recordDateLabel}`}
          >
            <img
              src={p.url}
              alt={p.caption ?? ''}
              loading="lazy"
              className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
            />
            {p.caption && photos.length <= 2 && (
              <span className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-on-surface/70 to-transparent px-3 py-2 text-body-sm text-white text-left">
                {p.caption}
              </span>
            )}
            {showOverlay && (
              <span className="absolute inset-0 flex items-center justify-center bg-on-surface/55 text-white font-display font-bold text-headline-sm">
                +{extra}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function MeasurementChip({
  label,
  unit,
  value,
  previous,
}: {
  label: string
  unit: string
  value: number
  previous: number | null
}) {
  const delta = previous !== null ? value - previous : null
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1)

  return (
    <div className="inline-flex items-baseline gap-1.5 rounded-lg bg-surface-low px-3 py-1.5">
      <Ruler className="w-3 h-3 text-on-surface/40 self-center" />
      <span className="text-label-sm text-on-surface/50 uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="font-display font-bold text-body-md text-on-surface tabular-nums">
        {formatted}
      </span>
      <span className="text-body-sm text-on-surface/50">{unit}</span>
      {delta !== null && delta !== 0 && (
        <span
          className={cn(
            'text-label-sm font-semibold tabular-nums ml-0.5',
            delta > 0 ? 'text-emerald-600' : 'text-amber-600',
          )}
        >
          {delta > 0 ? '+' : ''}
          {Number.isInteger(delta) ? delta : delta.toFixed(1)}
        </span>
      )}
    </div>
  )
}

function NoteBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-sm uppercase tracking-wider font-semibold text-on-surface/50">
        {label}
      </span>
      <p className="text-body-md text-on-surface/80 leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </div>
  )
}
