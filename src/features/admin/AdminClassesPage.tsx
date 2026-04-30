import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus, CalendarDays, Users, Clock, UserCog } from 'lucide-react'
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
import { listActiveBranches, type Branch } from '@/lib/branches'
import { listProfiles } from '@/lib/auth'
import { listCoachIdsByClassMap, syncClassCoaches } from '@/lib/classCoaches'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile } from '@/types/auth.types'
import type { ClassGroup, BeltLevel, TrainingDay } from '@/types/content.types'
import { beltLevelLabels, trainingDayLabels, trainingDayShortLabels } from '@/data/classes'
import { cn } from '@/utils/cn'

interface FormValues {
  name: string
  description: string
  age_range: string
  instructor: string  // public site display string — coach picker'dan auto-derive
  time_start: string
  time_end: string
  capacity: number
  sort_order: number
  is_active: boolean
  branch_id: string
}

const BELT_LEVELS: BeltLevel[] = ['beyaz', 'sari', 'yesil', 'mavi', 'kirmizi', 'siyah']
const TRAINING_DAYS: TrainingDay[] = [
  'pazartesi',
  'sali',
  'carsamba',
  'persembe',
  'cuma',
  'cumartesi',
  'pazar',
]

export function AdminClassesPage() {
  const [items, setItems] = useState<ClassGroup[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [coaches, setCoaches] = useState<UserProfile[]>([])
  const [classCoachMap, setClassCoachMap] = useState<Map<string, string[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<ClassGroup | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const branchById = new Map(branches.map((b) => [b.id, b]))
  const coachById = new Map(coaches.map((c) => [c.id, c]))

  const load = async () => {
    setIsLoading(true)
    const [list, branchList, coachList] = await Promise.all([
      listAllClasses(),
      listActiveBranches(),
      listProfiles({ role: 'coach' }),
    ])
    setItems(list)
    setBranches(branchList)
    setCoaches(coachList)
    if (list.length > 0) {
      const map = await listCoachIdsByClassMap(list.map((c) => c.id))
      setClassCoachMap(map)
    }
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
                  {branchById.get(c.branch_id) && (
                    <Badge variant="secondary">
                      {branchById.get(c.branch_id)!.name}
                    </Badge>
                  )}
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

              {/* Atanmış antrenörler */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-surface-low/50">
                <UserCog className="w-3.5 h-3.5 text-on-surface/40 shrink-0" />
                {(classCoachMap.get(c.id) ?? []).length === 0 ? (
                  <span className="text-body-sm text-amber-700">
                    Antrenör atanmamış
                  </span>
                ) : (
                  (classCoachMap.get(c.id) ?? []).map((coachId) => {
                    const coach = coachById.get(coachId)
                    return coach ? (
                      <Badge key={coachId} variant="secondary">
                        {coach.full_name || coach.email}
                      </Badge>
                    ) : null
                  })
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ClassFormModal
        isOpen={isCreating || editing !== null}
        existing={editing}
        branches={branches}
        coaches={coaches}
        existingCoachIds={editing ? classCoachMap.get(editing.id) ?? [] : []}
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
  branches: Branch[]
  coaches: UserProfile[]
  existingCoachIds: string[]
  onClose: () => void
  onSaved: () => void
}

function ClassFormModal({ isOpen, existing, branches, coaches, existingCoachIds, onClose, onSaved }: FormModalProps) {
  const { user } = useAuth()
  const [selectedLevels, setSelectedLevels] = useState<BeltLevel[]>(existing?.belt_levels ?? [])
  const [selectedDays, setSelectedDays] = useState<TrainingDay[]>(existing?.days ?? [])
  const [selectedCoachIds, setSelectedCoachIds] = useState<Set<string>>(new Set())

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
          branch_id: existing?.branch_id ?? branches[0]?.id ?? '',
        }
      : undefined,
  })

  useEffect(() => {
    if (isOpen) {
      setSelectedLevels(existing?.belt_levels ?? [])
      setSelectedDays(existing?.days ?? [])
      setSelectedCoachIds(new Set(existingCoachIds))
    }
  }, [isOpen, existing, existingCoachIds])

  const toggleCoach = (id: string) => {
    setSelectedCoachIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const computeInstructorString = (): string => {
    // Public site display: seçili koç(lar)ın isimlerini join et.
    const names = [...selectedCoachIds]
      .map((id) => coaches.find((c) => c.id === id)?.full_name)
      .filter(Boolean) as string[]
    return names.length > 0 ? names.join(', ') : 'Henüz atanmadı'
  }

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
    if (!data.branch_id) {
      setError('root', { message: 'Branş seçimi zorunlu.' })
      return
    }
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
      instructor: computeInstructorString(),
      sort_order: Number(data.sort_order),
      is_active: data.is_active,
      branch_id: data.branch_id,
    }

    const { classGroup, error } = existing
      ? await updateClass(existing.id, payload)
      : await createClass(payload)

    if (error || !classGroup) {
      setError('root', { message: error ?? 'Kayıt başarısız.' })
      return
    }

    // Coach atamalarını sync et
    if (user) {
      const { error: syncError } = await syncClassCoaches(
        classGroup.id,
        [...selectedCoachIds],
        user.id,
      )
      if (syncError) {
        setError('root', { message: `Antrenör ataması başarısız: ${syncError}` })
        return
      }
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
        <div className="flex flex-col gap-1.5">
          <label className="text-label-md text-on-surface/80 font-medium">
            Branş <span className="text-primary">*</span>
          </label>
          <select
            {...register('branch_id', { required: 'Branş seçimi zorunlu.' })}
            className="bg-surface-low rounded-md px-3 py-2.5 text-body-md text-on-surface border border-transparent focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">— Seç —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.billing_model === 'monthly' ? 'Aylık' : 'Paket'})
              </option>
            ))}
          </select>
          {errors.branch_id && (
            <p className="text-body-sm text-primary">{errors.branch_id.message}</p>
          )}
        </div>

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

        <Input
          label="Yaş Aralığı"
          type="text"
          placeholder="8–12 yaş"
          error={errors.age_range?.message}
          {...register('age_range', { required: 'Yaş aralığı gereklidir.' })}
        />

        {/* Antrenör seçici — multi-select */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">
            Antrenörler{' '}
            <span className="text-on-surface/45 font-normal">
              (bu sınıfa öğretebilen koçlar)
            </span>
          </span>
          {coaches.length === 0 ? (
            <p className="text-body-sm text-on-surface/55 bg-surface-low rounded-md px-3 py-2">
              Henüz onaylı antrenör yok.{' '}
              <span className="text-on-surface/45">Önce Antrenörler sayfasından ekle.</span>
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto bg-surface-low rounded-md p-2">
              {coaches.map((c) => {
                const isOn = selectedCoachIds.has(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCoach(c.id)}
                    aria-pressed={isOn}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors min-h-touch',
                      isOn
                        ? 'bg-primary text-white'
                        : 'bg-surface text-on-surface/80 hover:bg-surface-high',
                    )}
                  >
                    <span className="font-display font-semibold text-body-sm">
                      {c.full_name || c.email}
                    </span>
                    <div
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                        isOn ? 'border-white bg-white/20' : 'border-on-surface/30',
                      )}
                    >
                      {isOn && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none">
                          <path
                            d="M5 12l5 5L20 7"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          <p className="text-label-sm text-on-surface/45">
            Atanan antrenörler bu sınıfın yoklamasını alır ve sadece bu öğrencileri
            görür. Public sitedeki "Antrenör" kısmında otomatik isimleri gösterilir.
          </p>
        </div>

        {/* Instructor field gizli — picker'dan auto-derive */}
        <input type="hidden" {...register('instructor')} />

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
          <div className="flex flex-wrap gap-1.5">
            {TRAINING_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                title={trainingDayLabels[day]}
                className={cn(
                  'px-2.5 py-1 rounded-md text-label-sm font-semibold transition-colors min-w-[44px]',
                  selectedDays.includes(day)
                    ? 'bg-secondary text-white'
                    : 'bg-surface-low text-on-surface/60 hover:bg-surface-high'
                )}
              >
                {trainingDayShortLabels[day]}
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
