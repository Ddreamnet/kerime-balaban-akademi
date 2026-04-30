import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Cake,
  CalendarClock,
  Check,
  Images,
  List,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import {
  deleteRecord,
  listRecordsForChild,
  type PerformanceRecord,
} from '@/lib/performance'
import type { Child } from '@/lib/children'
import { setChildBillingConfig } from '@/lib/payments'
import { getBranchById, type Branch } from '@/lib/branches'
import {
  listPackagesByChild,
  abandonPackage,
  type Package as PackageRow,
} from '@/lib/packages'
import { PageHeader } from '@/components/dashboard'
import { listActiveClasses } from '@/lib/classes'
import {
  assignCoach,
  listCoachesForChild,
  unassignCoach,
  type AssignedCoach,
} from '@/lib/assignments'
import { useAuth } from '@/hooks/useAuth'
import { beltLevelLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import type { UserProfile } from '@/types/auth.types'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'
import { PerformanceTimeline } from '@/features/performance/PerformanceTimeline'
import { PerformanceRecordModal } from '@/features/performance/PerformanceRecordModal'
import { PerformancePhotoGallery } from '@/features/performance/PerformancePhotoGallery'
import { CoachPickerModal } from '@/components/admin/CoachPickerModal'

interface ParentInfo {
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

export function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [child, setChild] = useState<Child | null>(null)
  const [parent, setParent] = useState<ParentInfo | null>(null)
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PerformanceRecord | null>(null)
  const [isCreatingRecord, setIsCreatingRecord] = useState(false)
  const [tab, setTab] = useState<'timeline' | 'photos'>('timeline')

  const [assignedCoaches, setAssignedCoaches] = useState<AssignedCoach[]>([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [coachBusy, setCoachBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('children')
        .select(`
          *,
          profiles!children_parent_id_fkey (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle()

      if (!data) {
        if (!cancelled) {
          setNotFound(true)
          setIsLoading(false)
        }
        return
      }

      const parentRaw = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      const c: Child = {
        id: data.id,
        parent_id: data.parent_id,
        full_name: data.full_name,
        birthday: data.birthday,
        class_group_id: data.class_group_id,
        branch_id: (data as { branch_id?: string }).branch_id ?? '',
        package_price_override:
          (data as { package_price_override?: number | null }).package_price_override ?? null,
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

      const classes = await listActiveClasses()

      if (cancelled) return
      setChild(c)
      setParent(
        parentRaw
          ? {
              full_name: parentRaw.full_name,
              email: parentRaw.email,
              phone: parentRaw.phone,
              avatar_url: parentRaw.avatar_url ?? null,
            }
          : null,
      )
      setClassGroup(classes.find((cls) => cls.id === c.class_group_id) ?? null)
      setIsLoading(false)

      setRecordsLoading(true)
      const [recs, coaches] = await Promise.all([
        listRecordsForChild(c.id),
        listCoachesForChild(c.id),
      ])
      if (!cancelled) {
        setRecords(recs)
        setAssignedCoaches(coaches)
        setRecordsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleAssignCoach = async (coach: UserProfile) => {
    if (!child) return
    setCoachBusy(coach.id)
    const { error } = await assignCoach(child.id, coach.id, user?.id ?? null)
    if (!error) {
      setAssignedCoaches((prev) => [
        ...prev,
        {
          coach_id: coach.id,
          full_name: coach.full_name,
          email: coach.email,
          avatar_url: coach.avatar_url ?? null,
          assigned_at: new Date().toISOString(),
        },
      ])
    }
    setCoachBusy(null)
    setIsPickerOpen(false)
  }

  const handleUnassignCoach = async (coachId: string) => {
    if (!child) return
    if (!confirm('Bu antrenörü atamadan çıkarmak istediğinize emin misiniz?')) return
    setCoachBusy(coachId)
    const { error } = await unassignCoach(child.id, coachId)
    if (!error) {
      setAssignedCoaches((prev) => prev.filter((c) => c.coach_id !== coachId))
    }
    setCoachBusy(null)
  }

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
        <BackLink />
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

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <BackLink />
      <PageHeader kicker="Yönetici Paneli" title="Öğrenci Detayı" />

      {/* Identity */}
      <Card className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden shadow-primary-glow/20">
            {child.avatar_url ? (
              <img
                src={child.avatar_url}
                alt={child.full_name}
                className="w-full h-full object-cover"
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
              {child.gender && (
                <Badge variant="default">
                  {child.gender === 'kiz' ? 'Kız' : 'Erkek'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 border-t border-surface-low">
          {child.birthday && (
            <InfoRow icon={Cake} label="Doğum Tarihi" value={formatDateLong(child.birthday)} />
          )}
          {child.start_date && (
            <InfoRow
              icon={ShieldCheck}
              label="Akademideki Başlangıç"
              value={formatDateLong(child.start_date)}
            />
          )}
          {classGroup && (
            <InfoRow
              icon={Users}
              label="Grup"
              value={`${classGroup.name} · ${classGroup.age_range}`}
              subvalue={`${classGroup.time_start} – ${classGroup.time_end}`}
            />
          )}
          {child.tc_no && <InfoRow icon={User} label="TC Kimlik" value={child.tc_no} />}
          {child.license_no && (
            <InfoRow icon={ShieldCheck} label="Lisans No" value={child.license_no} />
          )}
        </div>

        {(child.notes || child.coach_note) && (
          <div className="flex flex-col gap-3 pt-2 border-t border-surface-low">
            {child.notes && <NoteBlock label="Sağlık / Özel Durum" body={child.notes} />}
            {child.coach_note && <NoteBlock label="Antrenör Notu" body={child.coach_note} />}
          </div>
        )}
      </Card>

      {/* Coaches */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
            Antrenörler
          </p>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-body-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Antrenör Ekle
          </button>
        </div>

        {assignedCoaches.length === 0 ? (
          <p className="text-body-sm text-on-surface/50 bg-amber-50 border border-amber-200/60 rounded-md px-3 py-2">
            Bu öğrenciye henüz antrenör atanmadı.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {assignedCoaches.map((c) => (
              <div
                key={c.coach_id}
                className="flex items-center gap-3 rounded-lg bg-surface-low p-2"
              >
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-secondary">
                      {c.full_name[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-body-md text-on-surface truncate">
                    {c.full_name}
                  </p>
                  <p className="text-body-sm text-on-surface/50 truncate">{c.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnassignCoach(c.coach_id)}
                  disabled={coachBusy === c.coach_id}
                  aria-label="Atamadan çıkar"
                  className="p-2 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 shrink-0"
                >
                  {coachBusy === c.coach_id ? (
                    <Spinner size="sm" color="inherit" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <CoachPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          excludeIds={assignedCoaches.map((c) => c.coach_id)}
          onPick={handleAssignCoach}
        />
      </Card>

      {/* Parent */}
      {parent && (
        <Card>
          <div className="flex flex-col gap-3">
            <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
              Veli Bilgileri
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                {parent.avatar_url ? (
                  <img
                    src={parent.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-bold text-primary">
                    {parent.full_name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <span className="font-display font-semibold text-body-md text-on-surface">
                {parent.full_name}
              </span>
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

      {/* Billing config */}
      <BillingSettingsCard
        child={child}
        onSaved={(updated) => setChild(updated)}
      />

      {/* Paketler — sadece package modeli branş için */}
      <PackagesCard child={child} />


      {/* Performance */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 border-b border-surface-low">
          {([
            { key: 'timeline', label: 'Kayıtlar', icon: List },
            { key: 'photos', label: 'Fotoğraflar', icon: Images },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-body-sm font-semibold transition-colors',
                'border-b-2 -mb-px min-h-touch',
                tab === t.key
                  ? 'text-primary border-primary'
                  : 'text-on-surface/60 border-transparent hover:text-on-surface',
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'timeline' ? (
          <PerformanceTimeline
            records={records}
            isLoading={recordsLoading}
            onAdd={() => setIsCreatingRecord(true)}
            onEdit={(r) => setEditingRecord(r)}
            onDelete={handleDeleteRecord}
          />
        ) : (
          <PerformancePhotoGallery records={records} isLoading={recordsLoading} />
        )}
      </div>

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

function BackLink() {
  return (
    <Link
      to="/admin/uyeler"
      className="flex items-center gap-2 text-body-sm text-on-surface/60 hover:text-primary w-fit"
    >
      <ArrowLeft className="w-4 h-4" />
      Üyeler
    </Link>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  subvalue,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subvalue?: string
}) {
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

/**
 * Billing config: anchor date for the per-child cycle + due-day override.
 * Saving triggers DB-side regeneration of 12 future periods (see migration
 * 20260425120000_payment_billing_cycle.sql).
 */
function BillingSettingsCard({
  child,
  onSaved,
}: {
  child: Child
  onSaved: (updated: Child) => void
}) {
  const [editing, setEditing] = useState(false)
  const [startDate, setStartDate] = useState<string>(child.billing_start_date ?? '')
  const [dueDay, setDueDay] = useState<string>(
    child.payment_due_day != null ? String(child.payment_due_day) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  // Default due day = day of start_date when admin hasn't overridden it.
  const startDay = startDate ? new Date(startDate).getDate() : null
  const effectiveDueDay = dueDay ? Number(dueDay) : startDay

  const handleEdit = () => {
    setStartDate(child.billing_start_date ?? '')
    setDueDay(child.payment_due_day != null ? String(child.payment_due_day) : '')
    setError(null)
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!startDate) {
      setError('Başlangıç tarihi seçin.')
      return
    }
    const parsedDueDay = dueDay ? Number(dueDay) : null
    if (parsedDueDay !== null && (parsedDueDay < 1 || parsedDueDay > 31)) {
      setError('Vade günü 1 ile 31 arasında olmalı.')
      return
    }

    setSaving(true)
    setError(null)
    const { error: err } = await setChildBillingConfig(child.id, {
      billing_start_date: startDate,
      payment_due_day: parsedDueDay,
    })
    setSaving(false)

    if (err) {
      setError(err)
      return
    }

    onSaved({
      ...child,
      billing_start_date: startDate,
      payment_due_day: parsedDueDay,
    })
    setEditing(false)
    setSavedAt(Date.now())
  }

  const handleClear = async () => {
    if (!confirm('Ödeme planı silinsin mi? Henüz ödenmemiş gelecek periyotlar kaldırılır.')) {
      return
    }
    setSaving(true)
    setError(null)
    const { error: err } = await setChildBillingConfig(child.id, {
      billing_start_date: null,
      payment_due_day: null,
    })
    setSaving(false)

    if (err) {
      setError(err)
      return
    }

    onSaved({ ...child, billing_start_date: null, payment_due_day: null })
    setEditing(false)
  }

  // Hide the "kaydedildi" pill 4s after save.
  useEffect(() => {
    if (savedAt === null) return
    const t = setTimeout(() => setSavedAt(null), 4000)
    return () => clearTimeout(t)
  }, [savedAt])

  const isConfigured = !!child.billing_start_date

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
            Ödeme Planı
          </p>
        </div>
        {savedAt !== null && (
          <span className="inline-flex items-center gap-1 text-body-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <Check className="w-3.5 h-3.5" />
            Kaydedildi
          </span>
        )}
      </div>

      {!editing && !isConfigured && (
        <div className="flex flex-col gap-3">
          <div className="text-body-sm text-on-surface/60 bg-amber-50 border border-amber-200/60 rounded-md px-3 py-2.5">
            Bu öğrenci için ödeme planı henüz belirlenmedi. Başlangıç tarihini
            kaydeder kaydetmez 12 aylık ödeme dönemi otomatik oluşturulur.
          </div>
          <div>
            <Button variant="primary" size="md" onClick={handleEdit}>
              <CalendarClock className="w-4 h-4" />
              Ödeme Planı Belirle
            </Button>
          </div>
        </div>
      )}

      {!editing && isConfigured && (
        <div className="flex flex-col gap-3">
          <InfoRow
            icon={CalendarClock}
            label="Aylık Dönem Başlangıcı"
            value={formatDateLong(child.billing_start_date!)}
            subvalue={`Sonraki dönem: ${formatDateLong(addOneMonth(child.billing_start_date!))}`}
          />
          <InfoRow
            icon={Wallet}
            label="Vade Günü"
            value={`Her ayın ${child.payment_due_day ?? new Date(child.billing_start_date!).getDate()}.'i`}
            subvalue={
              child.payment_due_day != null
                ? 'Yöneticinin manuel belirlediği vade günü'
                : 'Başlangıç tarihiyle aynı (varsayılan)'
            }
          />
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              Düzenle
            </Button>
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="text-body-sm text-on-surface/50 hover:text-primary px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              Planı Temizle
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface/60 uppercase tracking-wider">
                Aylık Dönem Başlangıç Tarihi
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-body-sm text-on-surface/50">
                Örn. 18 Mart seçilirse her dönem ayın 18'inde başlar.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface/60 uppercase tracking-wider">
                Vade Günü (1-31)
              </label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                placeholder={startDay != null ? String(startDay) : 'Otomatik'}
                onChange={(e) => setDueDay(e.target.value)}
              />
              <p className="text-body-sm text-on-surface/50">
                Boş bırakılırsa başlangıç günüyle aynı olur (
                {effectiveDueDay ?? '?'}).
              </p>
            </div>
          </div>

          {error && (
            <p className="text-body-sm text-primary bg-primary/5 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
              Kaydet
            </Button>
            <Button variant="ghost" size="md" onClick={handleCancel} disabled={saving}>
              İptal
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

/**
 * Add one calendar month, clamping the day so e.g. Jan 31 + 1 month = Feb 28.
 * Mirrors the DB-side behavior of `period + interval '1 month'` for the
 * "Sonraki dönem" hint.
 */
function addOneMonth(iso: string): string {
  const d = new Date(iso)
  const targetDay = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + 1)
  const lastOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(targetDay, lastOfMonth))
  return d.toISOString().slice(0, 10)
}

// ─── Paketler card ──────────────────────────────────────────────────────────

const PACKAGE_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  completed: 'Tamamlandı',
  abandoned: 'Bırakıldı',
}

function PackagesCard({ child }: { child: Child }) {
  const [branch, setBranch] = useState<Branch | null>(null)
  const [packages, setPackages] = useState<PackageRow[]>([])
  const [extraCounts, setExtraCounts] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [abandoningId, setAbandoningId] = useState<string | null>(null)

  const reload = async () => {
    setIsLoading(true)
    const [b, pkgs] = await Promise.all([
      getBranchById(child.branch_id),
      listPackagesByChild(child.id),
    ])
    setBranch(b)
    setPackages(pkgs)
    if (pkgs.length > 0) {
      const { data: extras } = await supabase
        .from('lessons')
        .select('package_id')
        .in('package_id', pkgs.map((p) => p.id))
        .eq('is_extra', true)
      const map = new Map<string, number>()
      for (const row of (extras ?? []) as { package_id: string }[]) {
        map.set(row.package_id, (map.get(row.package_id) ?? 0) + 1)
      }
      setExtraCounts(map)
    }
    setIsLoading(false)
  }

  const handleAbandon = async (packageId: string) => {
    if (
      !confirm(
        'Bu paketi "bırakıldı" olarak işaretlemek istediğinden emin misin?\n' +
          'Kalan dersler ve telafi hakkı yanar; iade verilmez. Veliye otomatik bildirim gitmez (manuel iletişim gerekir).',
      )
    )
      return
    setAbandoningId(packageId)
    const { error } = await abandonPackage(packageId)
    setAbandoningId(null)
    if (error) {
      alert(`Başarısız: ${error}`)
      return
    }
    await reload()
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      const [b, pkgs] = await Promise.all([
        getBranchById(child.branch_id),
        listPackagesByChild(child.id),
      ])
      if (cancelled) return
      setBranch(b)
      setPackages(pkgs)

      // Extra count'ları paketlere göre topla
      if (pkgs.length > 0) {
        const { data: extras } = await supabase
          .from('lessons')
          .select('package_id')
          .in('package_id', pkgs.map((p) => p.id))
          .eq('is_extra', true)
        if (cancelled) return
        const map = new Map<string, number>()
        for (const row of (extras ?? []) as { package_id: string }[]) {
          map.set(row.package_id, (map.get(row.package_id) ?? 0) + 1)
        }
        setExtraCounts(map)
      }
      setIsLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [child.id, child.branch_id])

  if (isLoading) return null
  if (branch?.billing_model !== 'package') return null

  const active = packages.find((p) => p.status === 'active')
  const past = packages.filter((p) => p.status !== 'active')

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
          Paketler — {branch.name}
        </p>
        <Badge variant="secondary">{packages.length} paket geçmiş</Badge>
      </div>

      {!active && packages.length === 0 && (
        <p className="text-body-sm text-on-surface/55 bg-surface-low rounded-md px-3 py-3 text-center">
          Henüz paket başlatılmamış. Koç ilk yoklamayı işaretleyince otomatik
          oluşturulur (implicit consent).
        </p>
      )}

      {active && (
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <strong className="font-display text-title-md text-primary">
                Paket #{active.package_number}
              </strong>
              <Badge variant="success">Aktif</Badge>
            </div>
            <div className="text-body-sm text-on-surface/60">
              {active.start_date && `Başlangıç: ${formatDateLong(active.start_date)}`}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-body-sm">
              <span className="font-semibold text-on-surface">
                {active.used_slots} / {active.total_slots} ders
              </span>
              <span className="text-on-surface/60">
                {active.total_slots - active.used_slots} kaldı
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(active.used_slots / active.total_slots) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <span className="text-on-surface/55">Telafi:</span>{' '}
              <strong className="text-on-surface">
                {active.telafi_granted ? 'Aktif (1 hak)' : 'Kullanılmadı'}
              </strong>
            </div>
            <div>
              <span className="text-on-surface/55">Yedek ders:</span>{' '}
              <strong className="text-on-surface">
                {extraCounts.get(active.id) ?? 0}
              </strong>
            </div>
            <div>
              <span className="text-on-surface/55">Planlanan bitiş:</span>{' '}
              <strong className="text-on-surface">
                {active.planned_end_date ? formatDateLong(active.planned_end_date) : '—'}
              </strong>
            </div>
            <div>
              <span className="text-on-surface/55">Fiyat:</span>{' '}
              <strong className="text-on-surface">
                {active.price !== null ? `${active.price} ₺` : '—'}
              </strong>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAbandon(active.id)}
              loading={abandoningId === active.id}
              className="text-wine hover:bg-wine/5"
            >
              Paketi sonlandır (bırakıldı)
            </Button>
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-label-sm text-on-surface/45 uppercase tracking-widest">
            Geçmiş Paketler
          </p>
          {past.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 bg-surface-low rounded-lg p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-display font-semibold text-body-md text-on-surface">
                  Paket #{p.package_number}
                </span>
                <Badge
                  variant={p.status === 'completed' ? 'success' : 'warning'}
                >
                  {PACKAGE_STATUS_LABELS[p.status] ?? p.status}
                </Badge>
              </div>
              <div className="text-body-sm text-on-surface/60 text-right">
                <div>
                  {p.used_slots}/{p.total_slots}
                  {(extraCounts.get(p.id) ?? 0) > 0 && ` · +${extraCounts.get(p.id)}`}
                </div>
                {p.actual_end_date && (
                  <div className="text-label-sm text-on-surface/45">
                    {formatDateLong(p.actual_end_date)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
