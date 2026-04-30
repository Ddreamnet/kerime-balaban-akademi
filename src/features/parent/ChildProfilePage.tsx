import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Baby, Cake, Pencil, X, Check, ShieldCheck, Users as UsersIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { PageHeader } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import {
  getMyChild,
  createChild,
  updateChild,
  type Child,
} from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { getBranchByCode, getBranchById } from '@/lib/branches'
import { getActivePackage, type Package as PackageRow } from '@/lib/packages'
import { listUpcomingLessons, type Lesson } from '@/lib/lessons'
import { beltLevelLabels } from '@/data/classes'
import type { BeltLevel, ClassGroup } from '@/types/content.types'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ChildFormValues {
  full_name: string
  birthday: string
  class_group_id: string
  belt_level: BeltLevel | ''
  avatar_url: string
}

/**
 * Parent: Çocuğum — single-child registration and editing.
 *
 * UX:
 * - Parent has no child → registration form (primary CTA)
 * - Parent has child → readonly summary + edit button
 * - Edit mode → inline form with Save/Cancel
 */
export function ChildProfilePage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const [c, cls] = await Promise.all([
        getMyChild(user.id),
        listActiveClasses(),
      ])
      setChild(c)
      setClasses(cls)
      setIsLoading(false)
    }
    void load()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        kicker="Veli Paneli"
        title="Çocuğum"
        description={
          child
            ? 'Çocuğunuzun bilgilerini görüntüleyin ve düzenleyin.'
            : 'Çocuğunuzu akademiye kaydedin.'
        }
      />

      {/* Content: view or edit */}
      {child && !isEditing ? (
        <>
          <ChildView child={child} classes={classes} onEdit={() => setIsEditing(true)} />
          <PackageStatusCard child={child} />
        </>
      ) : (
        <ChildForm
          existing={child}
          classes={classes}
          parentId={user?.id ?? ''}
          onSaved={(saved) => {
            setChild(saved)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}

// ─── Read view ───────────────────────────────────────────────────────────────

function ChildView({
  child,
  classes,
  onEdit,
}: {
  child: Child
  classes: ClassGroup[]
  onEdit: () => void
}) {
  const classGroup = classes.find((c) => c.id === child.class_group_id)

  return (
    <Card className="flex flex-col gap-5">
      {/* Avatar + name */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow/20">
          {child.avatar_url ? (
            <img
              src={child.avatar_url}
              alt={child.full_name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <span className="font-display font-black text-white text-2xl">
              {child.full_name[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-headline-sm text-on-surface">
            {child.full_name}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {child.belt_level && (
              <Badge variant="primary">{beltLevelLabels[child.belt_level]} Kuşak</Badge>
            )}
            {classGroup && <Badge variant="secondary">{classGroup.name}</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
          Düzenle
        </Button>
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-3 pt-2 border-t border-surface-low">
        {child.birthday && (
          <InfoRow icon={Cake} label="Doğum Tarihi" value={formatDateLong(child.birthday)} />
        )}
        {classGroup && (
          <InfoRow
            icon={UsersIcon}
            label="Grup"
            value={`${classGroup.name} · ${classGroup.age_range}`}
            subvalue={`${classGroup.time_start} – ${classGroup.time_end}`}
          />
        )}
        {child.belt_level && (
          <InfoRow
            icon={ShieldCheck}
            label="Seviye"
            value={`${beltLevelLabels[child.belt_level]} Kuşak`}
          />
        )}
      </div>

      {/* Note about coach edits */}
      <p className="text-body-sm text-on-surface/40 bg-surface-low rounded-md px-3 py-2">
        Not: Antrenörünüz de çocuğunuzun adını ve profil fotoğrafını güncelleyebilir.
      </p>
    </Card>
  )
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subvalue?: string
}

function InfoRow({ icon: Icon, label, value, subvalue }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">{label}</p>
        <p className="text-body-md font-semibold text-on-surface">{value}</p>
        {subvalue && <p className="text-body-sm text-on-surface/50">{subvalue}</p>}
      </div>
    </div>
  )
}

// ─── Form (create + edit) ────────────────────────────────────────────────────

interface ChildFormProps {
  existing: Child | null
  classes: ClassGroup[]
  parentId: string
  onSaved: (child: Child) => void
  onCancel: () => void
}

function ChildForm({ existing, classes, parentId, onSaved, onCancel }: ChildFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChildFormValues>({
    defaultValues: {
      full_name: existing?.full_name ?? '',
      birthday: existing?.birthday ?? '',
      class_group_id: existing?.class_group_id ?? '',
      belt_level: existing?.belt_level ?? '',
      avatar_url: existing?.avatar_url ?? '',
    },
  })

  const selectedClassId = watch('class_group_id')
  const selectedBelt = watch('belt_level')
  const currentAvatar = watch('avatar_url')

  const onSubmit = async (data: ChildFormValues) => {
    const payload: Parameters<typeof createChild>[1] = {
      full_name: data.full_name,
      birthday: data.birthday || null,
      class_group_id: data.class_group_id || null,
      belt_level: (data.belt_level || null) as BeltLevel | null,
      avatar_url: data.avatar_url || null,
    }

    // Yeni çocukta default taekwondo branş'ına bağla — admin sonradan istediği
    // branş'a (kickboks/cimnastik) taşıyabilir.
    if (!existing) {
      const taekwondo = await getBranchByCode('taekwondo')
      if (!taekwondo) {
        setError('root', { message: 'Varsayılan branş bulunamadı, admin ile iletişime geç.' })
        return
      }
      payload.branch_id = taekwondo.id
    }

    const { child, error } = existing
      ? await updateChild(existing.id, payload)
      : await createChild(parentId, payload)

    if (error || !child) {
      setError('root', { message: error ?? 'Kayıt başarısız.' })
      return
    }

    onSaved(child)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex items-center gap-3">
          {existing ? (
            <AvatarUpload
              value={currentAvatar || null}
              ownerId={existing.id}
              fallbackLabel={existing.full_name}
              onChange={(url) => setValue('avatar_url', url ?? '', { shouldDirty: true })}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <Baby className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-display font-bold text-title-lg text-on-surface">
              {existing ? 'Bilgileri Düzenle' : 'Çocuğumu Kaydet'}
            </h2>
            <p className="text-body-sm text-on-surface/50">
              {existing
                ? 'Değişiklikleri kaydetmek için güncelle.'
                : 'Akademiye kayıt için temel bilgiler.'}
            </p>
          </div>
        </div>
        <input type="hidden" {...register('avatar_url')} />

        <Input
          label="Ad Soyad"
          type="text"
          placeholder="Çocuğunuzun adı ve soyadı"
          error={errors.full_name?.message}
          {...register('full_name', {
            required: 'Ad soyad gereklidir.',
            minLength: { value: 2, message: 'En az 2 karakter olmalıdır.' },
          })}
        />

        <Input
          label="Doğum Tarihi"
          type="date"
          hint="Yaşına uygun grup seçimi ve doğum günü kutlaması için"
          error={errors.birthday?.message}
          {...register('birthday')}
        />

        {/* Class group selector */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">
            Grup Seçimi
          </span>
          {classes.length === 0 ? (
            <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-2">
              Henüz aktif ders grubu yok. Admin oluşturduktan sonra buradan seçebilirsiniz.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {classes.map((c) => (
                <OptionButton
                  key={c.id}
                  selected={selectedClassId === c.id}
                  onClick={() => setValue('class_group_id', c.id)}
                  title={c.name}
                  subtitle={`${c.age_range} · ${c.time_start}–${c.time_end}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Belt level selector */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">
            Mevcut Kuşak
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['beyaz', 'sari', 'yesil', 'mavi', 'kirmizi', 'siyah'] as BeltLevel[]).map((lvl) => (
              <OptionButton
                key={lvl}
                selected={selectedBelt === lvl}
                onClick={() => setValue('belt_level', lvl)}
                title={beltLevelLabels[lvl]}
                compact
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setValue('belt_level', '')}
            className="text-body-sm text-on-surface/40 hover:text-on-surface/70 transition-colors w-fit"
          >
            Temizle
          </button>
        </div>

        {errors.root && (
          <p
            className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
            role="alert"
          >
            {errors.root.message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="flex-1">
            <Check className="w-4 h-4" />
            {existing ? 'Güncelle' : 'Kaydet'}
          </Button>
          {existing && (
            <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
              <X className="w-4 h-4" />
              İptal
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  title: string
  subtitle?: string
  compact?: boolean
}

function OptionButton({ selected, onClick, title, subtitle, compact }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-lg text-left min-h-touch',
        'transition-all duration-150',
        compact ? 'p-3' : 'p-3.5',
        'focus-visible:outline-2 focus-visible:outline-primary',
        selected
          ? 'bg-primary-container ring-2 ring-primary'
          : 'bg-surface border border-outline/15 hover:bg-surface-low'
      )}
    >
      <span
        className={cn(
          'font-display font-semibold',
          compact ? 'text-body-md' : 'text-body-md',
          selected ? 'text-primary' : 'text-on-surface'
        )}
      >
        {title}
      </span>
      {subtitle && (
        <span className={cn('text-body-sm', selected ? 'text-primary/70' : 'text-on-surface/50')}>
          {subtitle}
        </span>
      )}
    </button>
  )
}

// ─── Paket durumu (parent view) ──────────────────────────────────────────────

function PackageStatusCard({ child }: { child: Child }) {
  const [pkg, setPkg] = useState<PackageRow | null>(null)
  const [upcoming, setUpcoming] = useState<Lesson[]>([])
  const [billingModel, setBillingModel] = useState<'monthly' | 'package' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [active, b, lessons] = await Promise.all([
        getActivePackage(child.id),
        getBranchById(child.branch_id),
        listUpcomingLessons(child.id, 5),
      ])
      if (cancelled) return
      setPkg(active)
      setBillingModel(b?.billing_model ?? null)
      setUpcoming(lessons)
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [child.id, child.branch_id])

  if (isLoading) return null
  if (billingModel !== 'package') return null

  if (!pkg) {
    return (
      <Card className="flex items-start gap-3 py-4">
        <Baby className="w-5 h-5 text-on-surface/40 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-display font-semibold text-body-md text-on-surface">
            Henüz aktif paket yok
          </p>
          <p className="text-body-sm text-on-surface/60">
            Antrenör ilk yoklamayı işaretlediğinde 8-derslik paketin otomatik başlar.
          </p>
        </div>
      </Card>
    )
  }

  const remaining = pkg.total_slots - pkg.used_slots
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-label-sm text-on-surface/45 uppercase tracking-widest">
            Aktif paket
          </p>
          <h3 className="font-display font-bold text-title-lg text-primary mt-0.5">
            Paket #{pkg.package_number}
          </h3>
        </div>
        {pkg.telafi_granted && <Badge variant="secondary">Telafi hakkı eklendi</Badge>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-body-sm">
          <span className="font-semibold text-on-surface">
            {pkg.used_slots} / {pkg.total_slots} ders
          </span>
          <span className="text-on-surface/60">{remaining} ders kaldı</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(pkg.used_slots / pkg.total_slots) * 100}%` }}
          />
        </div>
      </div>

      {pkg.planned_end_date && (
        <p className="text-body-sm text-on-surface/65">
          Planlanan bitiş tarihi:{' '}
          <strong className="text-on-surface">
            {formatDateLong(pkg.planned_end_date)}
          </strong>
        </p>
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-surface-low">
          <p className="text-label-sm text-on-surface/45 uppercase tracking-widest">
            Gelecek dersler
          </p>
          <ul className="flex flex-col gap-1.5">
            {upcoming.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 bg-surface-low rounded-md px-3 py-2 text-body-sm"
              >
                <span className="text-on-surface">{formatDateLong(l.scheduled_date)}</span>
                <span className="text-on-surface/60 text-label-sm">
                  {l.is_telafi && <Badge variant="secondary">Telafi</Badge>}
                  {l.is_extra && <Badge variant="warning">Ek ders</Badge>}
                  {l.scheduled_time && <span className="ml-2">{l.scheduled_time}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

