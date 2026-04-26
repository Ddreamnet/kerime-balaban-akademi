import { useEffect, useState } from 'react'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import {
  assignCoach,
  listUnassignedChildIds,
} from '@/lib/assignments'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { useAuth } from '@/hooks/useAuth'
import { beltLevelLabels } from '@/data/classes'
import type { UserProfile } from '@/types/auth.types'
import { CoachPickerModal } from '@/components/admin/CoachPickerModal'

/**
 * Admin: henüz antrenörü olmayan öğrencileri listeler ve hızlı atama yaptırır.
 * Dashboard uyarı kartından buraya bağlanılır.
 */
export function AdminAssignmentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pickerFor, setPickerFor] = useState<ChildWithParent | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const [all, unassignedIds] = await Promise.all([
      listAllChildren(),
      listUnassignedChildIds(),
    ])
    setStudents(all.filter((s) => unassignedIds.has(s.id)))
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handlePick = async (coach: UserProfile) => {
    if (!pickerFor) return
    const child = pickerFor
    setBusyId(child.id)
    const { error } = await assignCoach(child.id, coach.id, user?.id ?? null)
    if (!error) {
      setStudents((prev) => prev.filter((s) => s.id !== child.id))
    }
    setBusyId(null)
    setPickerFor(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Antrenör Atamaları"
        description="Antrenörü olmayan öğrenciler. Hızlı atama yapmak için öğrencinin yanındaki butona dokunun."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Tüm öğrencilerin antrenörü atanmış"
          description="Yeni bir çocuk kaydedildiğinde burada tekrar görünecek."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((s) => (
            <Card key={s.id} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden">
                {s.avatar_url ? (
                  <img
                    src={s.avatar_url}
                    alt={s.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-white text-base">
                    {s.full_name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
                  {s.full_name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1 text-body-sm text-on-surface/60">
                  {s.belt_level && (
                    <Badge variant="primary">{beltLevelLabels[s.belt_level]}</Badge>
                  )}
                  <span className="truncate">
                    Veli: <span className="font-medium text-on-surface/70">{s.parent_name}</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPickerFor(s)}
                disabled={busyId === s.id}
                className="inline-flex items-center gap-1.5 px-3 h-10 min-w-[44px] rounded-md bg-primary text-white text-body-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
              >
                {busyId === s.id ? (
                  <Spinner size="sm" color="inherit" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Antrenör Ata</span>
                    <span className="sm:hidden">Ata</span>
                  </>
                )}
              </button>
            </Card>
          ))}
        </div>
      )}

      <CoachPickerModal
        isOpen={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        excludeIds={[]}
        onPick={handlePick}
      />
    </div>
  )
}
