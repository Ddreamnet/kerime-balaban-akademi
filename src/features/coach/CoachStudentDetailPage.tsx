import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Cake,
  Check,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { supabase } from '@/lib/supabase'
import { updateChild, type Child } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import {
  deleteRecord,
  listRecordsForChild,
  type PerformanceRecord,
} from '@/lib/performance'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/dashboard'
import { beltLevelLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import { formatDateLong } from '@/utils/format'
import { PerformanceTimeline } from '@/features/performance/PerformanceTimeline'
import { PerformanceRecordModal } from '@/features/performance/PerformanceRecordModal'

interface FormValues {
  full_name: string
  avatar_url: string
}

interface ParentInfo {
  full_name: string
  email: string
  phone: string | null
}

/**
 * Coach: student detail + inline edit.
 * Per Phase 4 rule #3, coach can edit: full_name, avatar_url.
 * Everything else (birthday, class, belt, notes) is read-only for coaches
 * and reserved for admin.
 */
export function CoachStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [parent, setParent] = useState<ParentInfo | null>(null)
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PerformanceRecord | null>(null)
  const [isCreatingRecord, setIsCreatingRecord] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const currentAvatar = watch('avatar_url')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('children')
        .select(`
          *,
          profiles!children_parent_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (!data) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      const cls = await listActiveClasses()
      setClasses(cls)

      const parentRaw = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      setParent(
        parentRaw
          ? {
              full_name: parentRaw.full_name,
              email: parentRaw.email,
              phone: parentRaw.phone,
            }
          : null,
      )

      const c: Child = {
        id: data.id,
        parent_id: data.parent_id,
        full_name: data.full_name,
        birthday: data.birthday,
        class_group_id: data.class_group_id,
        belt_level: data.belt_level as Child['belt_level'],
        avatar_url: data.avatar_url,
        notes: data.notes,
        gender: (data.gender as Child['gender']) ?? null,
        tc_no: data.tc_no ?? null,
        license_no: data.license_no ?? null,
        start_date: data.start_date ?? null,
        coach_note: data.coach_note ?? null,
        billing_start_date: data.billing_start_date ?? null,
        payment_due_day: data.payment_due_day ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
      setChild(c)
      reset({ full_name: c.full_name, avatar_url: c.avatar_url ?? '' })
      setIsLoading(false)

      setRecordsLoading(true)
      const recs = await listRecordsForChild(c.id)
      setRecords(recs)
      setRecordsLoading(false)
    }
    void load()
  }, [id, reset])

  const handleDeleteRecord = async (recordId: string) => {
    const { error } = await deleteRecord(recordId)
    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId))
    }
  }

  const handleRecordSaved = (saved: PerformanceRecord) => {
    setRecords((prev) => {
      const without = prev.filter((r) => r.id !== saved.id)
      return [saved, ...without].sort((a, b) => {
        if (a.recorded_at !== b.recorded_at) {
          return a.recorded_at < b.recorded_at ? 1 : -1
        }
        return a.created_at < b.created_at ? 1 : -1
      })
    })
    setEditingRecord(null)
    setIsCreatingRecord(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound || !child) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Link to="/antrenor/ogrenciler" className="flex items-center gap-2 text-body-sm text-on-surface/60 hover:text-primary w-fit">
          <ArrowLeft className="w-4 h-4" />
          Öğrenciler
        </Link>
        <Card className="py-12 text-center">
          <p className="font-display font-bold text-title-lg text-on-surface">
            Öğrenci bulunamadı
          </p>
          <p className="text-body-md text-on-surface/60 mt-2">
            Aradığınız öğrenci mevcut değil veya kaldırılmış olabilir.
          </p>
        </Card>
      </div>
    )
  }

  const classGroup = classes.find((c) => c.id === child.class_group_id)

  const onSubmit = async (data: FormValues) => {
    const { child: updated, error } = await updateChild(child.id, {
      full_name: data.full_name,
      avatar_url: data.avatar_url || null,
    })

    if (error || !updated) {
      setError('root', { message: error ?? 'Güncelleme başarısız.' })
      return
    }

    setChild(updated)
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate('/antrenor/ogrenciler')}
        className="flex items-center gap-2 text-body-sm text-on-surface/60 hover:text-primary w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Öğrenciler
      </button>

      <PageHeader kicker="Antrenör Paneli" title="Öğrenci Detayı" />

      {/* Main identity card */}
      {isEditing ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                <Pencil className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-bold text-title-lg text-on-surface">
                Öğrenci Bilgilerini Düzenle
              </h2>
            </div>

            <Input
              label="Ad Soyad"
              type="text"
              placeholder="Öğrencinin ad soyadı"
              error={errors.full_name?.message}
              {...register('full_name', {
                required: 'Ad soyad gereklidir.',
                minLength: { value: 2, message: 'En az 2 karakter olmalıdır.' },
              })}
            />

            <div className="flex flex-col gap-2">
              <span className="text-label-md text-on-surface/80 font-medium">
                Profil Fotoğrafı
              </span>
              <div className="flex items-center gap-3">
                <AvatarUpload
                  value={currentAvatar || null}
                  ownerId={child.id}
                  fallbackLabel={child.full_name}
                  onChange={(url) =>
                    setValue('avatar_url', url ?? '', { shouldDirty: true })
                  }
                />
                <p className="text-body-sm text-on-surface/60">
                  Fotoğrafa dokunarak kameradan çek veya galeriden seç.
                </p>
              </div>
              <input type="hidden" {...register('avatar_url')} />
            </div>

            {/* Permission note */}
            <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-2.5">
              <Lock className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
              <p className="text-body-sm text-on-surface/60 leading-relaxed">
                Antrenör olarak sadece ad soyad ve profil fotoğrafını düzenleyebilirsiniz.
                Grup, kuşak, doğum tarihi ve notlar için yöneticiyle iletişime geçin.
              </p>
            </div>

            {errors.root && (
              <p
                className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2"
                role="alert"
              >
                {errors.root.message}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  reset({ full_name: child.full_name, avatar_url: child.avatar_url ?? '' })
                  setIsEditing(false)
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                className="flex-1"
              >
                <Check className="w-4 h-4" />
                Kaydet
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow/20">
              {child.avatar_url ? (
                <img
                  src={child.avatar_url}
                  alt={child.full_name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="font-display font-black text-white text-3xl">
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
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
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
                icon={Users}
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
        </Card>
      )}

      {/* Parent info */}
      {parent && (
        <Card>
          <div className="flex flex-col gap-3">
            <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
              Veli Bilgileri
            </p>
            <div className="flex items-center gap-2 text-body-md text-on-surface">
              <span className="font-semibold">{parent.full_name}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <a
                href={`mailto:${parent.email}`}
                className="flex items-center gap-1.5 text-body-sm text-on-surface/60 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {parent.email}
              </a>
              {parent.phone && (
                <a
                  href={`tel:${parent.phone}`}
                  className="flex items-center gap-1.5 text-body-sm text-on-surface/60 hover:text-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {parent.phone}
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Performance */}
      <PerformanceTimeline
        records={records}
        isLoading={recordsLoading}
        onAdd={() => setIsCreatingRecord(true)}
        onEdit={(r) => setEditingRecord(r)}
        onDelete={handleDeleteRecord}
      />

      <PerformanceRecordModal
        childId={child.id}
        recordedBy={user?.id ?? null}
        existing={editingRecord}
        isOpen={isCreatingRecord || editingRecord !== null}
        onClose={() => {
          setIsCreatingRecord(false)
          setEditingRecord(null)
        }}
        onSaved={handleRecordSaved}
      />
    </div>
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
