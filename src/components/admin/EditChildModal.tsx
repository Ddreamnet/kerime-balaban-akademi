import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Baby } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { updateChild, type ChildWithParent, type Gender } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { beltLevelLabels } from '@/data/classes'
import type { BeltLevel, ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'

interface EditChildModalProps {
  child: ChildWithParent | null
  isOpen: boolean
  onClose: () => void
  onSaved: (updated: ChildWithParent) => void
}

interface FormValues {
  full_name: string
  birthday: string
  gender: Gender | ''
  belt_level: BeltLevel | ''
  class_group_id: string
  start_date: string
  avatar_url: string
  tc_no: string
  license_no: string
  notes: string
  coach_note: string
}

export function EditChildModal({ child, isOpen, onClose, onSaved }: EditChildModalProps) {
  const [classes, setClasses] = useState<ClassGroup[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    values: child
      ? {
          full_name: child.full_name,
          birthday: child.birthday ?? '',
          gender: child.gender ?? '',
          belt_level: child.belt_level ?? '',
          class_group_id: child.class_group_id ?? '',
          start_date: child.start_date ?? '',
          avatar_url: child.avatar_url ?? '',
          tc_no: child.tc_no ?? '',
          license_no: child.license_no ?? '',
          notes: child.notes ?? '',
          coach_note: child.coach_note ?? '',
        }
      : undefined,
  })

  useEffect(() => {
    if (!isOpen) return
    void listActiveClasses().then(setClasses)
  }, [isOpen])

  if (!child) return null

  const selectedGender = watch('gender')
  const selectedBelt = watch('belt_level')
  const selectedClassId = watch('class_group_id')
  const currentAvatar = watch('avatar_url')

  const onSubmit = async (data: FormValues) => {
    const tc = data.tc_no.trim()
    if (tc && !/^\d{11}$/.test(tc)) {
      setError('tc_no', { message: 'TC kimlik numarası 11 rakam olmalıdır.' })
      return
    }

    const payload = {
      full_name: data.full_name,
      birthday: data.birthday || null,
      gender: (data.gender || null) as Gender | null,
      belt_level: (data.belt_level || null) as BeltLevel | null,
      class_group_id: data.class_group_id || null,
      start_date: data.start_date || null,
      avatar_url: data.avatar_url || null,
      tc_no: tc || null,
      license_no: data.license_no.trim() || null,
      notes: data.notes.trim() || null,
      coach_note: data.coach_note.trim() || null,
    }

    const { child: updated, error } = await updateChild(child.id, payload)
    if (error || !updated) {
      setError('root', { message: error ?? 'Güncelleme başarısız.' })
      return
    }

    onSaved({ ...child, ...updated })
    reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Öğrenci bilgileri"
      description={child.full_name}
      icon={Baby}
      size="lg"
      decoratedHeader
      footer={
        <>
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            form="edit-child-form"
            variant="primary"
            size="md"
            loading={isSubmitting}
          >
            Kaydet
          </Button>
        </>
      }
    >
      <form
        id="edit-child-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload
            value={currentAvatar || null}
            ownerId={child.id}
            fallbackLabel={child.full_name}
            onChange={(url) => setValue('avatar_url', url ?? '', { shouldDirty: true })}
          />
        </div>
        <input type="hidden" {...register('avatar_url')} />

        {/* Temel bilgiler */}
        <Section title="Temel Bilgiler">
          <Input
            label="Ad Soyad"
            type="text"
            placeholder="Öğrencinin adı ve soyadı"
            error={errors.full_name?.message}
            {...register('full_name', {
              required: 'Ad soyad gereklidir.',
              minLength: { value: 2, message: 'En az 2 karakter olmalıdır.' },
            })}
          />

          <Input
            label="Doğum Tarihi"
            type="date"
            hint="Yaşı buradan otomatik hesaplanır"
            error={errors.birthday?.message}
            {...register('birthday')}
          />

          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Cinsiyet</span>
            <div className="grid grid-cols-3 gap-2">
              <GenderOption
                label="Kız"
                selected={selectedGender === 'kiz'}
                onClick={() => setValue('gender', 'kiz', { shouldDirty: true })}
              />
              <GenderOption
                label="Erkek"
                selected={selectedGender === 'erkek'}
                onClick={() => setValue('gender', 'erkek', { shouldDirty: true })}
              />
              <GenderOption
                label="Belirtme"
                muted
                selected={selectedGender === ''}
                onClick={() => setValue('gender', '', { shouldDirty: true })}
              />
            </div>
          </div>
        </Section>

        {/* Akademi */}
        <Section title="Akademi">
          <Input
            label="Başlangıç Tarihi"
            type="date"
            hint="Öğrencinin akademideki ilk günü"
            {...register('start_date')}
          />

          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Kuşak</span>
            <div className="grid grid-cols-3 gap-2">
              {(['beyaz', 'sari', 'yesil', 'mavi', 'kirmizi', 'siyah'] as BeltLevel[]).map((lvl) => (
                <Chip
                  key={lvl}
                  selected={selectedBelt === lvl}
                  onClick={() => setValue('belt_level', lvl, { shouldDirty: true })}
                >
                  {beltLevelLabels[lvl]}
                </Chip>
              ))}
            </div>
            {selectedBelt && (
              <ClearLink onClick={() => setValue('belt_level', '', { shouldDirty: true })}>
                Temizle
              </ClearLink>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Grup</span>
            {classes.length === 0 ? (
              <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-2">
                Aktif grup yok.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {classes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setValue('class_group_id', c.id, { shouldDirty: true })}
                    aria-pressed={selectedClassId === c.id}
                    className={cn(
                      'flex flex-col items-start gap-0.5 rounded-lg text-left p-3 min-h-touch',
                      'transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                      selectedClassId === c.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-low text-on-surface/80 hover:bg-surface-high',
                    )}
                  >
                    <span className="font-display font-semibold text-body-md">{c.name}</span>
                    <span
                      className={cn(
                        'text-body-sm',
                        selectedClassId === c.id ? 'text-white/80' : 'text-on-surface/50',
                      )}
                    >
                      {c.age_range} · {c.time_start}–{c.time_end}
                    </span>
                  </button>
                ))}
                {selectedClassId && (
                  <ClearLink onClick={() => setValue('class_group_id', '', { shouldDirty: true })}>
                    Gruptan çıkar
                  </ClearLink>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Kimlik & Lisans */}
        <Section title="Kimlik & Lisans">
          <Input
            label="TC Kimlik Numarası"
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder="11 hane"
            hint="Federasyon kaydı için gerekli olabilir"
            error={errors.tc_no?.message}
            {...register('tc_no')}
          />

          <Input
            label="Lisans Numarası"
            type="text"
            placeholder="Varsa federasyon lisans no"
            {...register('license_no')}
          />
        </Section>

        {/* Notlar */}
        <Section title="Notlar">
          <Textarea
            label="Sağlık / Özel Durum Notu"
            placeholder="Alerji, sağlık durumu veya önemli uyarılar"
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />

          <Textarea
            label="Antrenör Notu"
            placeholder="Antrenörün uzun vadeli gözlem ve notları"
            hint="Sadece admin ve antrenörler görür"
            rows={3}
            {...register('coach_note')}
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
      </form>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-label-md uppercase tracking-widest font-semibold text-primary/80">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-lg p-3 text-body-sm font-semibold text-center min-h-touch',
        'transition-colors focus-visible:outline-2 focus-visible:outline-primary',
        selected
          ? 'bg-primary text-white'
          : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
      )}
    >
      {children}
    </button>
  )
}

function GenderOption({
  label,
  selected,
  onClick,
  muted,
}: {
  label: string
  selected: boolean
  onClick: () => void
  muted?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-lg p-3 text-body-sm font-semibold text-center min-h-touch',
        'transition-colors focus-visible:outline-2 focus-visible:outline-primary',
        selected
          ? muted
            ? 'bg-surface-high text-on-surface/80'
            : 'bg-primary text-white'
          : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
      )}
    >
      {label}
    </button>
  )
}

function ClearLink({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-sm text-on-surface/40 hover:text-on-surface/70 transition-colors w-fit"
    >
      {children}
    </button>
  )
}
