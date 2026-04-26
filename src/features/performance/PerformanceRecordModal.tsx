import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import {
  createRecord,
  deletePhoto,
  insertPhotos,
  updatePhoto,
  updateRecord,
  type PerformancePhoto,
  type PerformanceRecord,
  type PerformanceRecordInput,
} from '@/lib/performance'
import { cn } from '@/utils/cn'

interface Props {
  childId: string
  recordedBy: string | null
  existing: PerformanceRecord | null
  isOpen: boolean
  onClose: () => void
  onSaved: (record: PerformanceRecord) => void
}

interface FormValues {
  recorded_at: string
  height_cm: string
  weight_kg: string
  split_cm: string
  forward_reach_cm: string
  jump_cm: string
  technique_notes: string
  general_note: string
  exam_ready: boolean
}

/**
 * Photo draft — represents a photo in the modal's local state.
 * id is set for photos already in DB. _removed flags existing photos the
 * user wants to delete on save. _new flags uploads to insert on save.
 */
interface PhotoDraft {
  key: string
  id?: string
  url: string
  caption: string
  originalCaption?: string
  _new?: boolean
  _removed?: boolean
}

const today = () => new Date().toISOString().slice(0, 10)

function toNumber(v: string): number | null {
  const t = v.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return isNaN(n) ? null : n
}

function toDrafts(photos: PerformancePhoto[]): PhotoDraft[] {
  return photos.map((p) => ({
    key: p.id,
    id: p.id,
    url: p.url,
    caption: p.caption ?? '',
    originalCaption: p.caption ?? '',
  }))
}

export function PerformanceRecordModal({
  childId,
  recordedBy,
  existing,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    values: isOpen
      ? {
          recorded_at: existing?.recorded_at ?? today(),
          height_cm: existing?.height_cm?.toString() ?? '',
          weight_kg: existing?.weight_kg?.toString() ?? '',
          split_cm: existing?.split_cm?.toString() ?? '',
          forward_reach_cm: existing?.forward_reach_cm?.toString() ?? '',
          jump_cm: existing?.jump_cm?.toString() ?? '',
          technique_notes: existing?.technique_notes ?? '',
          general_note: existing?.general_note ?? '',
          exam_ready: existing?.exam_ready ?? false,
        }
      : undefined,
  })

  const [photos, setPhotos] = useState<PhotoDraft[]>([])

  useEffect(() => {
    if (isOpen) {
      setPhotos(existing ? toDrafts(existing.photos) : [])
    }
  }, [isOpen, existing])

  const examReady = watch('exam_ready')

  const addPhoto = (url: string) => {
    setPhotos((prev) => [
      ...prev,
      { key: `new-${Date.now()}-${Math.random()}`, url, caption: '', _new: true },
    ])
  }

  const updateCaption = (key: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, caption } : p)),
    )
  }

  const removePhoto = (key: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.key === key)
      if (!target) return prev
      if (target._new) {
        // Never saved — drop from state.
        return prev.filter((p) => p.key !== key)
      }
      // Existing photo — mark for deletion.
      return prev.map((p) => (p.key === key ? { ...p, _removed: true } : p))
    })
  }

  const restorePhoto = (key: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, _removed: false } : p)),
    )
  }

  const syncPhotos = async (recordId: string) => {
    const toDelete = photos.filter((p) => p._removed && p.id)
    const toInsert = photos.filter((p) => p._new && !p._removed)
    const toUpdate = photos.filter(
      (p) => p.id && !p._new && !p._removed && p.caption !== p.originalCaption,
    )

    await Promise.all(toDelete.map((p) => deletePhoto(p.id!)))

    if (toInsert.length) {
      // Use the current visible order as sort_order basis.
      const visible = photos.filter((p) => !p._removed)
      await insertPhotos(
        recordId,
        toInsert.map((p) => ({
          url: p.url,
          caption: p.caption || null,
          sort_order: visible.findIndex((v) => v.key === p.key),
        })),
      )
    }

    await Promise.all(
      toUpdate.map((p) =>
        updatePhoto(p.id!, { caption: p.caption || null }),
      ),
    )
  }

  const onSubmit = async (data: FormValues) => {
    const payload: PerformanceRecordInput = {
      child_id: childId,
      recorded_at: data.recorded_at,
      recorded_by: recordedBy,
      height_cm: toNumber(data.height_cm),
      weight_kg: toNumber(data.weight_kg),
      split_cm: toNumber(data.split_cm),
      forward_reach_cm: toNumber(data.forward_reach_cm),
      jump_cm: toNumber(data.jump_cm),
      technique_notes: data.technique_notes.trim() || null,
      general_note: data.general_note.trim() || null,
      exam_ready: data.exam_ready,
    }

    const { record, error } = existing
      ? await updateRecord(existing.id, payload)
      : await createRecord(payload)

    if (error || !record) {
      setError('root', { message: error ?? 'Kayıt başarısız.' })
      return
    }

    try {
      await syncPhotos(record.id)
    } catch (err) {
      setError('root', {
        message:
          err instanceof Error ? err.message : 'Fotoğraflar kaydedilemedi.',
      })
      return
    }

    // Re-fetch by re-running update to include the latest photos array.
    // Simpler: merge local draft state into the returned record.
    const finalPhotos: PerformancePhoto[] = photos
      .filter((p) => !p._removed)
      .map((p, i) => ({
        id: p.id ?? p.key,
        record_id: record.id,
        url: p.url,
        caption: p.caption || null,
        sort_order: i,
        created_at: new Date().toISOString(),
      }))

    reset()
    onSaved({ ...record, photos: finalPhotos })
  }

  const visiblePhotos = photos.filter((p) => !p._removed)
  const removedPhotos = photos.filter((p) => p._removed)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? 'Performans kaydını düzenle' : 'Yeni performans kaydı'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Input
          label="Tarih"
          type="date"
          error={errors.recorded_at?.message}
          {...register('recorded_at', { required: 'Tarih gereklidir.' })}
        />

        <Section title="Fiziksel" hint="İstediğiniz alanı doldurun, boş bırakılanlar kaydedilmez.">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Boy (cm)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              placeholder="138"
              {...register('height_cm')}
            />
            <Input
              label="Kilo (kg)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              placeholder="34"
              {...register('weight_kg')}
            />
          </div>
        </Section>

        <Section title="Esneklik" hint="Yerden cm cinsinden. Küçük rakam daha esnek demek.">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kerme (cm)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              placeholder="20"
              {...register('split_cm')}
            />
            <Input
              label="Öne Uzanma (cm)"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              placeholder="10"
              {...register('forward_reach_cm')}
            />
          </div>
        </Section>

        <Section title="Güç">
          <Input
            label="Dikey Sıçrama (cm)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            placeholder="24"
            {...register('jump_cm')}
          />
        </Section>

        <Section title="Gözlem">
          <Textarea
            label="Teknik Not"
            placeholder="Tekme yüksekliği, denge, kombinasyon — serbestçe yazın"
            rows={3}
            {...register('technique_notes')}
          />
          <Textarea
            label="Genel Not"
            placeholder="Bu ölçümle ilgili genel bir not"
            rows={2}
            {...register('general_note')}
          />

          <button
            type="button"
            onClick={() => setValue('exam_ready', !examReady, { shouldDirty: true })}
            aria-pressed={examReady}
            className={cn(
              'flex items-center justify-between gap-3 rounded-md p-3 text-left min-h-touch',
              'transition-colors focus-visible:outline-2 focus-visible:outline-primary',
              examReady
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-surface-low border border-transparent hover:bg-surface-high',
            )}
          >
            <div>
              <p className="font-display font-semibold text-body-md text-on-surface">
                Sınav / müsabakaya hazır
              </p>
              <p className="text-body-sm text-on-surface/50">
                Bir sonraki kuşak sınavı veya müsabaka için uygun.
              </p>
            </div>
            <div
              className={cn(
                'w-10 h-6 rounded-full relative transition-colors shrink-0',
                examReady ? 'bg-primary' : 'bg-on-surface/20',
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  examReady ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </div>
          </button>
        </Section>

        <Section
          title="Fotoğraflar"
          hint="Birden fazla fotoğraf ekleyebilirsiniz. Her birine kısa bir açıklama yazabilirsiniz."
        >
          {visiblePhotos.length > 0 && (
            <div className="flex flex-col gap-3">
              {visiblePhotos.map((p) => (
                <PhotoRow
                  key={p.key}
                  photo={p}
                  onCaptionChange={(caption) => updateCaption(p.key, caption)}
                  onRemove={() => removePhoto(p.key)}
                />
              ))}
            </div>
          )}

          {removedPhotos.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-label-sm text-on-surface/50 uppercase tracking-wider">
                Silinecek ({removedPhotos.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {removedPhotos.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => restorePhoto(p.key)}
                    className="relative w-16 h-16 rounded-md overflow-hidden group"
                    aria-label="Geri al"
                  >
                    <img
                      src={p.url}
                      alt=""
                      className="w-full h-full object-cover opacity-40"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-on-surface/30 text-white text-label-sm font-semibold">
                      Geri al
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ImageUpload
            folder="performance"
            value={null}
            allowRemove={false}
            hint="Kamera veya galeri. JPEG / PNG / WebP, en fazla 5 MB."
            onChange={(url) => {
              if (url) addPhoto(url)
            }}
          />
        </Section>

        {errors.root && (
          <p
            className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
            role="alert"
          >
            {errors.root.message}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="flex-1"
          >
            {existing ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function PhotoRow({
  photo,
  onCaptionChange,
  onRemove,
}: {
  photo: PhotoDraft
  onCaptionChange: (v: string) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-3 items-start bg-surface-low rounded-md p-2">
      <img
        src={photo.url}
        alt=""
        className="w-20 h-20 rounded-md object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Input
          label=""
          type="text"
          placeholder="Kısa açıklama (opsiyonel)"
          value={photo.caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          maxLength={80}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Fotoğrafı kaldır"
        className="p-2 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/10 transition-colors self-center shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-label-md uppercase tracking-widest font-semibold text-primary/80">
          {title}
        </h3>
        {hint && <p className="text-body-sm text-on-surface/50">{hint}</p>}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
