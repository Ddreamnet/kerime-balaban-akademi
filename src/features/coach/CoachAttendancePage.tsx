import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  X,
  Info,
  Users as UsersIcon,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { listActiveClasses } from '@/lib/classes'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { listActiveBranches, type Branch } from '@/lib/branches'
import { listClassIdsForCoach } from '@/lib/classCoaches'
import { getPackageProgressMap, type PackageProgress } from '@/lib/packages'
import { cancelClassLesson } from '@/lib/lessons'
import {
  getAttendanceForClassDate,
  upsertAttendance,
  ATTENDANCE_LABELS,
  type AttendanceStatus,
} from '@/lib/attendance'
import type { ClassGroup } from '@/types/content.types'
import { trainingDayLabels } from '@/data/classes'
import { PageHeader } from '@/components/dashboard'
import { formatCurrency, formatDateLong, todayIsoTrt } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Coach: Yoklama UI.
 *
 * Paket sisteminde (kickboks/cimnastik):
 *  - Aktif paketli öğrenci: "Ali 5/8" + telafi/extra badge'leri
 *  - Aktif paketsiz öğrenci: "🆕 Yeni paket — 800 ₺" badge → tıklayınca implicit
 *    consent modal confirm (DB trigger paket+lesson+invoice oluşturur)
 *  - "Bu dersi iptal et" butonu — sınıftaki tüm öğrencileri excused işaretler
 *
 * Monthly (taekwondo): mevcut basit cycle present→absent→excused.
 *
 * Coach atandığı branş'ların class'larını görür. Admin tüm class'ları görür.
 */
export function CoachAttendancePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [allChildren, setAllChildren] = useState<ChildWithParent[]>([])
  const [progressMap, setProgressMap] = useState<Map<string, PackageProgress>>(new Map())
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [date, setDate] = useState(() => todayIsoTrt())
  const [records, setRecords] = useState<Map<string, AttendanceStatus>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [savingChildId, setSavingChildId] = useState<string | null>(null)
  const [pendingConsent, setPendingConsent] = useState<{
    child: ChildWithParent
    branch: Branch
    nextStatus: AttendanceStatus
  } | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const branchById = useMemo(() => new Map(branches.map((b) => [b.id, b])), [branches])

  // Initial load
  useEffect(() => {
    const load = async () => {
      if (!user) return
      setIsLoading(true)
      const [allClasses, allBranches, allCh] = await Promise.all([
        listActiveClasses(),
        listActiveBranches(),
        listAllChildren(),
      ])
      setBranches(allBranches)
      setAllChildren(allCh)

      // Coach SADECE atandığı class'ları görür (class_coaches m2m).
      // Admin ise tüm class'ları görür.
      let visibleClasses = allClasses
      if (!isAdmin) {
        const myClassIds = new Set(await listClassIdsForCoach(user.id))
        visibleClasses = allClasses.filter((c) => myClassIds.has(c.id))
      }
      setClasses(visibleClasses)
      if (visibleClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(visibleClasses[0].id)
      }
      setIsLoading(false)
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin])

  // Class seçildiğinde: o sınıftaki çocukların paket progress'lerini topla
  const childrenInClass = useMemo(
    () => allChildren.filter((c) => c.class_group_id === selectedClassId),
    [allChildren, selectedClassId],
  )

  useEffect(() => {
    if (childrenInClass.length === 0) {
      setProgressMap(new Map())
      return
    }
    void getPackageProgressMap(childrenInClass.map((c) => c.id)).then(setProgressMap)
  }, [childrenInClass])

  // Class veya tarih değiştiğinde attendance kayıtlarını çek
  useEffect(() => {
    if (!selectedClassId) return
    const load = async () => {
      const list = await getAttendanceForClassDate(selectedClassId, date)
      const map = new Map<string, AttendanceStatus>()
      list.forEach((r) => map.set(r.child_id, r.status))
      setRecords(map)
    }
    void load()
  }, [selectedClassId, date])

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const selectedBranch = selectedClass ? branchById.get(selectedClass.branch_id) : null
  const isPackageBranch = selectedBranch?.billing_model === 'package'

  const changeDate = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  const computeNextStatus = (current: AttendanceStatus | undefined): AttendanceStatus =>
    current === undefined
      ? 'present'
      : current === 'present'
      ? 'absent'
      : current === 'absent'
      ? 'excused'
      : 'present'

  const applyAttendance = async (
    childId: string,
    classId: string,
    nextStatus: AttendanceStatus,
    previous: AttendanceStatus | undefined,
  ) => {
    if (!user) return
    setSavingChildId(childId)
    setRecords((prev) => new Map(prev).set(childId, nextStatus))

    const { error } = await upsertAttendance(childId, classId, date, nextStatus, user.id)
    if (error) {
      // Revert + hata göster
      setRecords((prev) => {
        const m = new Map(prev)
        if (previous === undefined) m.delete(childId)
        else m.set(childId, previous)
        return m
      })
      alert(`Kayıt başarısız: ${error}`)
    } else {
      // Trigger paket+lesson oluşturmuş olabilir → progress'i yenile
      if (isPackageBranch) {
        const fresh = await getPackageProgressMap(childrenInClass.map((c) => c.id))
        setProgressMap(fresh)
      }
    }
    setSavingChildId(null)
  }

  const onChildTap = (child: ChildWithParent) => {
    if (!selectedClassId || !selectedBranch) return
    const current = records.get(child.id)
    const next = computeNextStatus(current)

    // Aktif paketsiz + paket modeli branş + ilk işaretleme → confirm modal
    const noActivePackage = !progressMap.has(child.id)
    if (selectedBranch.billing_model === 'package' && noActivePackage && current === undefined) {
      setPendingConsent({ child, branch: selectedBranch, nextStatus: next })
      return
    }

    void applyAttendance(child.id, selectedClassId, next, current)
  }

  const confirmConsent = async () => {
    if (!pendingConsent || !selectedClassId) return
    // Modal'ı kapatmadan önce async tamamla — kullanıcı 2 kez tıklayamasın.
    await applyAttendance(
      pendingConsent.child.id,
      selectedClassId,
      pendingConsent.nextStatus,
      undefined,
    )
    setPendingConsent(null)
  }

  const handleCancelLesson = async () => {
    if (!selectedClassId) return
    setIsCancelling(true)
    const { count, error } = await cancelClassLesson(selectedClassId, date)
    setIsCancelling(false)
    setShowCancelConfirm(false)
    if (error) {
      alert(`İptal başarısız: ${error}`)
      return
    }
    alert(`${count} öğrenci için ders iptal edildi (mazeretli işaretlendi).`)
    // refetch
    const list = await getAttendanceForClassDate(selectedClassId, date)
    const map = new Map<string, AttendanceStatus>()
    list.forEach((r) => map.set(r.child_id, r.status))
    setRecords(map)
    if (isPackageBranch) {
      const fresh = await getPackageProgressMap(childrenInClass.map((c) => c.id))
      setProgressMap(fresh)
    }
  }

  const stats = useMemo(() => {
    const present = Array.from(records.values()).filter((s) => s === 'present').length
    const absent = Array.from(records.values()).filter((s) => s === 'absent').length
    const excused = Array.from(records.values()).filter((s) => s === 'excused').length
    return { present, absent, excused, unmarked: childrenInClass.length - records.size }
  }, [records, childrenInClass.length])

  // PostgreSQL EXTRACT(DOW): 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi.
  // Tüm 7 gün desteklenir; class'ların gerçek günleri sınıf form'unda seçilir.
  const TR_DOW = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const
  const isoDate = new Date(date)
  const dowName = TR_DOW[isoDate.getDay()]
  const isTrainingDayForClass = selectedClass?.days.includes(dowName) ?? false

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker={isAdmin ? 'Yönetici Paneli' : 'Antrenör Paneli'}
        title="Yoklama"
        description="Grup ve tarih seçin, her öğrenciye dokunarak durumu güncelleyin."
      />

      {/* Controls */}
      <Card className="flex flex-col gap-4">
        {/* Date selector */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeDate(-1)} aria-label="Önceki gün">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 flex flex-col items-center">
            <p className="font-display font-bold text-title-md text-on-surface">
              {formatDateLong(date)}
            </p>
            <p className="text-body-sm text-on-surface/50">
              {trainingDayLabels[dowName]}
              {selectedClass && (
                <>
                  {' · '}
                  {isTrainingDayForClass ? 'Antrenman' : (
                    <span className="text-amber-700">Antrenman günü değil</span>
                  )}
                </>
              )}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => changeDate(1)} aria-label="Sonraki gün">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md bg-surface-low border border-outline/15 px-3 py-1.5 text-body-sm focus:outline-none focus:border-primary/50"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDate(todayIsoTrt())}
            className="text-body-sm"
          >
            Bugüne dön
          </Button>
        </div>

        {/* Class selector */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-low">
          <span className="text-label-md text-on-surface/80 font-medium">Grup</span>
          {classes.length === 0 ? (
            <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-2">
              {isAdmin
                ? 'Henüz aktif grup yok.'
                : 'Sana atanmış grup yok. Admin ile iletişime geç.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => {
                const branchName = branchById.get(c.branch_id)?.name
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassId(c.id)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-body-sm font-semibold transition-colors',
                      selectedClassId === c.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-low text-on-surface/70 hover:bg-surface-high',
                    )}
                  >
                    {c.name}
                    {branchName && (
                      <span
                        className={cn(
                          'ml-1.5 text-[10px] uppercase tracking-wider opacity-80',
                          selectedClassId === c.id ? 'text-white/80' : 'text-on-surface/50',
                        )}
                      >
                        {branchName}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Class-level cancel */}
        {selectedClass && childrenInClass.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-surface-low">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              className="text-wine hover:bg-wine/5"
            >
              <XCircle className="w-4 h-4" />
              Bu dersi iptal et
            </Button>
            <span className="text-label-sm text-on-surface/45">
              Tüm öğrenciler mazeretli işaretlenir, paket bitişine 1 ders eklenir.
            </span>
          </div>
        )}
      </Card>

      {/* Stats strip */}
      {!isLoading && selectedClass && childrenInClass.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <StatTile label="Toplam" value={childrenInClass.length} variant="neutral" />
          <StatTile label="Geldi" value={stats.present} variant="success" />
          <StatTile label="Gelmedi" value={stats.absent} variant="danger" />
          <StatTile label="Mazeret" value={stats.excused} variant="warning" />
        </div>
      )}

      {/* Student list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !selectedClass ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarDays className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Önce bir grup seçin
          </p>
        </Card>
      ) : childrenInClass.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <UsersIcon className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Bu grupta öğrenci yok
          </p>
          <p className="text-body-md text-on-surface/60">
            Veliler çocuklarını bu gruba atadığında burada görünecek.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex items-start gap-2.5 bg-surface-low rounded-md px-3 py-2.5">
            <Info className="w-4 h-4 text-on-surface/40 shrink-0 mt-0.5" />
            <p className="text-body-sm text-on-surface/60 leading-relaxed">
              Her öğrenciye dokunarak durumu değiştirin:{' '}
              <strong>Geldi → Gelmedi → Mazeretli</strong>. Değişiklikler otomatik kaydedilir.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {childrenInClass.map((child) => {
              const status = records.get(child.id)
              const progress = progressMap.get(child.id)
              return (
                <AttendanceRow
                  key={child.id}
                  name={child.full_name}
                  avatarUrl={child.avatar_url}
                  status={status}
                  progress={progress ?? null}
                  isPackageBranch={isPackageBranch}
                  packagePrice={
                    isPackageBranch
                      ? child.package_price_override ?? selectedBranch?.default_price ?? null
                      : null
                  }
                  isSaving={savingChildId === child.id}
                  onTap={() => onChildTap(child)}
                />
              )
            })}
          </div>
        </>
      )}

      {/* Implicit consent modal */}
      {pendingConsent && (
        <Modal
          isOpen={true}
          onClose={() => setPendingConsent(null)}
          title="Yeni Paket Başlatılacak"
          icon={Sparkles}
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-on-surface">
              <strong>{pendingConsent.child.full_name}</strong> için yeni bir paket başlatılacak:
            </p>
            <div className="bg-surface-low rounded-lg p-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-on-surface/65">Branş:</span>
                <strong className="text-on-surface">{pendingConsent.branch.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface/65">Paket boyu:</span>
                <strong className="text-on-surface">
                  {pendingConsent.branch.default_package_size} ders
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface/65">Paket fiyatı:</span>
                <strong className="text-primary">
                  {(() => {
                    const price =
                      pendingConsent.child.package_price_override ??
                      pendingConsent.branch.default_price
                    return price !== null ? formatCurrency(price) : 'belirsiz'
                  })()}
                </strong>
              </div>
            </div>
            <p className="text-body-sm text-on-surface/65">
              Onayladığında paket otomatik oluşturulur ve veliye bildirim gider. Bu işaretleme
              yeni paketin <strong>1. dersi</strong> olur.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setPendingConsent(null)}
                disabled={savingChildId === pendingConsent.child.id}
              >
                İptal
              </Button>
              <Button
                variant="primary"
                onClick={confirmConsent}
                loading={savingChildId === pendingConsent.child.id}
              >
                Onayla ve İşaretle
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Class-level cancel confirm */}
      {showCancelConfirm && selectedClass && (
        <Modal
          isOpen={true}
          onClose={() => setShowCancelConfirm(false)}
          title="Dersi İptal Et"
          icon={XCircle}
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-on-surface">
              <strong>{formatDateLong(date)}</strong> tarihli{' '}
              <strong>{selectedClass.name}</strong> dersini iptal etmek istediğinden emin misin?
            </p>
            <div className="bg-surface-low rounded-lg p-4 text-body-sm text-on-surface/70 flex flex-col gap-1.5">
              <p>• Sınıftaki tüm öğrenciler için yoklama mazeretli işaretlenir.</p>
              <p>• Paket öğrencilerinin paket bitişine birer ders eklenir.</p>
              <p>• Velilere otomatik bildirim gider.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowCancelConfirm(false)} disabled={isCancelling}>
                Vazgeç
              </Button>
              <Button variant="primary" onClick={handleCancelLesson} loading={isCancelling}>
                Evet, İptal Et
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Stat tile ───────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: number
  variant: 'neutral' | 'success' | 'danger' | 'warning'
}

function StatTile({ label, value, variant }: StatTileProps) {
  const classes = {
    neutral: 'bg-surface-card text-on-surface',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-primary',
    warning: 'bg-yellow-50 text-yellow-700',
  }[variant]

  return (
    <div className={cn('rounded-lg py-3 px-2 shadow-ambient', classes)}>
      <p className="font-display font-black text-2xl leading-none">{value}</p>
      <p className="text-label-sm uppercase tracking-widest mt-1 opacity-80">{label}</p>
    </div>
  )
}

// ─── Attendance row ─────────────────────────────────────────────────────────

interface AttendanceRowProps {
  name: string
  avatarUrl: string | null
  status: AttendanceStatus | undefined
  progress: PackageProgress | null
  isPackageBranch: boolean
  packagePrice: number | null
  isSaving: boolean
  onTap: () => void
}

function AttendanceRow({
  name,
  avatarUrl,
  status,
  progress,
  isPackageBranch,
  packagePrice,
  isSaving,
  onTap,
}: AttendanceRowProps) {
  const statusConfig = status
    ? {
        present: {
          bg: 'bg-green-50 border-green-500',
          icon: Check,
          iconColor: 'text-green-600',
          label: ATTENDANCE_LABELS.present,
        },
        absent: {
          bg: 'bg-red-50 border-primary',
          icon: X,
          iconColor: 'text-primary',
          label: ATTENDANCE_LABELS.absent,
        },
        excused: {
          bg: 'bg-yellow-50 border-yellow-500',
          icon: Info,
          iconColor: 'text-yellow-700',
          label: ATTENDANCE_LABELS.excused,
        },
      }[status]
    : null

  const showNewPackageBadge = isPackageBranch && !progress

  return (
    <button
      onClick={onTap}
      disabled={isSaving}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 min-h-touch',
        'border-l-4 shadow-ambient',
        'active:scale-[0.99]',
        'focus-visible:outline-2 focus-visible:outline-primary',
        statusConfig
          ? statusConfig.bg
          : showNewPackageBadge
          ? 'bg-amber-50 border-amber-400 hover:bg-amber-100'
          : 'bg-surface-card border-transparent hover:bg-surface-low',
      )}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="font-display font-bold text-white">
            {name[0]?.toUpperCase() ?? '?'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-display font-semibold text-title-md text-on-surface truncate">
            {name}
          </span>
          {progress && (
            <>
              <span className="inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                {progress.display}
              </span>
              {progress.telafi_granted && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wide bg-secondary-container text-secondary"
                  title="Telafi hakkı eklendi"
                >
                  +T
                </span>
              )}
              {progress.extra_count > 0 && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-800"
                  title="Mazeretli/iptal yedek ders"
                >
                  +M{progress.extra_count}
                </span>
              )}
            </>
          )}
          {showNewPackageBadge && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold bg-amber-200 text-amber-900">
              <Sparkles className="w-3 h-3" />
              Yeni paket
              {packagePrice !== null && ` — ${formatCurrency(packagePrice)}`}
            </span>
          )}
        </div>
      </div>

      {statusConfig ? (
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'text-label-md uppercase tracking-widest font-semibold',
              statusConfig.iconColor,
            )}
          >
            {statusConfig.label}
          </span>
          <div
            className={cn(
              'w-8 h-8 rounded-full bg-white flex items-center justify-center',
              statusConfig.iconColor,
            )}
          >
            <statusConfig.icon className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <span className="text-body-sm text-on-surface/40 shrink-0">Dokun →</span>
      )}
    </button>
  )
}
