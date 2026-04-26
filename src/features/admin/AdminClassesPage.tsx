import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus, CalendarDays, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import {
  listAllClasses,
  createClass,
  updateClass,
  deleteClass,
  type ClassInput,
} from '@/lib/classes'
import type { ClassGroup, BeltLevel, TrainingDay } from '@/types/content.types'
import { beltLevelLabels, trainingDayLabels } from '@/data/classes'
import { cn } from '@/utils/cn'

interface FormValues {
  name: string
  description: string
  age_range: string
  instructor: string
  time_start: string
  time_end: string
  capacity: number
  sort_order: number
  is_active: boolean
}

const BELT_LEVELS: BeltLevel[] = ['beyaz', 'sari', 'yesil', 'mavi', 'kirmizi', 'siyah']
const TRAINING_DAYS: TrainingDay[] = ['pazartesi', 'carsamba', 'cuma']

export function AdminClassesPage() {
  const [items, setItems] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<ClassGroup | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listAllClasses()
    setItems(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu dersi silmek istediğinize emin misiniz? Kayıtlı öğrencilerin ders atamaları silinecektir.')) return
    setDeletingId(id)
    const { error } = await deleteClass(id)
    if (!error) setItems((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Dersler"
        description={`${items.length} ders (${items.filter((c) => c.is_active).length} aktif)`}
        action={
          <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" />
            Yeni Ders
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Henüz ders yok"
          description="İlk dersi eklemek için üstteki butonu kullanın."
          action={
            <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
              Yeni Ders
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((c) => (
            <Card key={c.id} className={cn('flex flex-col gap-3', !c.is_active && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {c.belt_levels.map((lvl) => (
                    <Badge key={lvl} variant="primary">
                      {beltLevelLabels[lvl]}
                    </Badge>
                  ))}
                  <Badge variant="default">{c.age_range}</Badge>
                  {!c.is_active && <Badge variant="warning">Pasif</Badge>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                    loading={deletingId === c.id}
                    className="text-primary hover:bg-primary/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-display text-title-lg text-on-surface">{c.name}</h3>

              <div className="flex flex-wrap gap-3 text-body-sm text-on-surface/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary/60" />
                  {c.time_start} – {c.time_end}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary/60" />
                  Maks. {c.capacity}
                </span>
              </div>

              <div className="flex gap-1 flex-wrap">
                {c.days.map((d) => (
                  <span
                    key={d}
                    className="bg-secondary-container text-secondary text-label-sm px-2 py-0.5 rounded"
                  >
                    {trainingDayLabels[d]}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ClassFormModal
        isOpen={isCreating || editing !== null}
        existing={editing}
        onClose={() => {
          setEditing(null)
          setIsCreating(false)
        }}
        onSaved={() => {
          setEditing(null)
          setIsCreating(false)
          void load()
        }}
      />
    </div>
  )
}

// ─── Form modal ─────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean
  existing: ClassGroup | null
  onClose: () => void
  onSaved: () => void
}

function ClassFormModal({ isOpen, existing, onClose, onSaved }: FormModalProps) {
  const [selectedLevels, setSelectedLevels] = useState<BeltLevel[]>(existing?.belt_levels ?? [])
  const [selectedDays, setSelectedDays] = useState<TrainingDay[]>(existing?.days ?? [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    values: isOpen
      ? {
          name: existing?.name ?? '',
          description: existing?.description ?? '',
          age_range: existing?.age_range ?? '',
          instructor: existing?.instructor ?? 'Kerime Balaban',
          time_start: existing?.time_start ?? '16:00',
          time_end: existing?.time_end ?? '17:30',
          capacity: existing?.capacity ?? 20,
          sort_order: 0,
          is_active: existing?.is_active ?? true,
        }
      : undefined,
  })

  useEffect(() => {
    if (isOpen) {
      setSelectedLevels(existing?.belt_levels ?? [])
      setSelectedDays(existing?.days ?? [])
    }
  }, [isOpen, existing])

  const isActive = watch('is_active')

  const toggleLevel = (lvl: BeltLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl],
    )
  }

  const toggleDay = (day: TrainingDay) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const onSubmit = async (data: FormValues) => {
    if (selectedLevels.length === 0) {
      setError('root', { message: 'En az bir kuşak seçin.' })
      return
    }
    if (selectedDays.length === 0) {
      setError('root', { message: 'En az bir antrenman günü seçin.' })
      return
    }

    const payload: ClassInput = {
      name: data.name,
      description: data.description,
      age_range: data.age_range,
      belt_levels: selectedLevels,
      days: selectedDays,
      time_start: data.time_start,
      time_end: data.time_end,
      capacity: Number(data.capacity),
      instructor: data.instructor,
      sort_order: Number(data.sort_order),
      is_active: data.is_active,
    }

    const { error } = existing
      ? await updateClass(existing.id, payload)
      : await createClass(payload)

    if (error) {
      setError('root', { message: error })
      return
    }

    reset()
    onSaved()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? 'Dersi düzenle' : 'Yeni ders'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Grup Adı"
          type="text"
          placeholder="Örn. Başlangıç Grubu"
          error={errors.name?.message}
          {...register('name', { required: 'Grup adı gereklidir.' })}
        />

        <Textarea
          label="Açıklama"
          placeholder="Grubun amacı, hedefi..."
          rows={3}
          error={errors.description?.message}
          {...register('description', { required: 'Açıklama gereklidir.' })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Yaş Aralığı"
            type="text"
            placeholder="8–12 yaş"
            error={errors.age_range?.message}
            {...register('age_range', { required: 'Yaş aralığı gereklidir.' })}
          />
          <Input
            label="Antrenör"
            type="text"
            placeholder="Kerime Balaban"
            error={errors.instructor?.message}
            {...register('instructor', { required: 'Antrenör gereklidir.' })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Başlangıç"
            type="time"
            error={errors.time_start?.message}
            {...register('time_start', { required: 'Başlangıç saati gereklidir.' })}
          />
          <Input
            label="Bitiş"
            type="time"
            error={errors.time_end?.message}
            {...register('time_end', { required: 'Bitiş saati gereklidir.' })}
          />
          <Input
            label="Kapasite"
            type="number"
            min={1}
            error={errors.capacity?.message}
            {...register('capacity', { required: 'Kapasite gereklidir.', valueAsNumber: true })}
          />
        </div>

        {/* Belt levels */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">Kuşaklar</span>
          <div className="flex flex-wrap gap-2">
            {BELT_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => toggleLevel(lvl)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-label-md font-semibold uppercase tracking-widest transition-colors',
                  selectedLevels.includes(lvl)
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface/60 hover:bg-surface-high'
                )}
              >
                {beltLevelLabels[lvl]}
              </button>
            ))}
          </div>
        </div>

        {/* Training days */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">Antrenman Günleri</span>
          <div className="flex flex-wrap gap-2">
            {TRAINING_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors',
                  selectedDays.includes(day)
                    ? 'bg-secondary text-white'
                    : 'bg-surface-low text-on-surface/60 hover:bg-surface-high'
                )}
              >
                {trainingDayLabels[day]}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Sıralama"
          type="number"
          hint="Dersler bu numaraya göre sıralanır (küçük = üstte)"
          {...register('sort_order', { valueAsNumber: true })}
        />

        {/* Active toggle */}
        <button
          type="button"
          onClick={() => setValue('is_active', !isActive)}
          className="flex items-center justify-between gap-3 bg-surface-low rounded-md p-3 text-left hover:bg-surface-high transition-colors"
        >
          <div>
            <p className="font-display font-semibold text-body-md text-on-surface">Aktif</p>
            <p className="text-body-sm text-on-surface/50">
              Kapalı dersler herkese açık sayfalarda görünmez.
            </p>
          </div>
          <div className={cn('w-10 h-6 rounded-full relative transition-colors shrink-0', isActive ? 'bg-primary' : 'bg-on-surface/20')}>
            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', isActive ? 'translate-x-4' : 'translate-x-0.5')} />
          </div>
        </button>

        {errors.root && (
          <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
            {errors.root.message}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="flex-1">
            {existing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
