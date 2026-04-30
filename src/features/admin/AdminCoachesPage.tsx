import { useEffect, useState } from 'react'
import { Mail, Phone, UserCog, Pencil, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EditProfileModal } from '@/components/admin/EditProfileModal'
import { PageHeader, EmptyState } from '@/components/dashboard'
import { listProfiles, deactivateUser, reactivateUser } from '@/lib/auth'
import { listActiveBranches, type Branch } from '@/lib/branches'
import { syncCoachBranches } from '@/lib/coachBranches'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/auth.types'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Admin: Antrenörler.
 * Coach profile + branş atama (m2m). Branş atama Faz 1+2'de eklenen
 * `coach_branches` tablosu üzerinden — her koç hangi branşlarda öğrettiği bu
 * sayfada yönetilir. RLS bu tablodan scope çekiyor.
 */
export function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<UserProfile[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [coachBranchMap, setCoachBranchMap] = useState<Map<string, string[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [editingBranches, setEditingBranches] = useState<UserProfile | null>(null)

  const branchById = new Map(branches.map((b) => [b.id, b]))

  const load = async () => {
    setIsLoading(true)
    const [coachList, branchList] = await Promise.all([
      listProfiles({ role: 'coach' }),
      listActiveBranches(),
    ])
    setCoaches(coachList)
    setBranches(branchList)

    if (coachList.length > 0) {
      const { data } = await supabase
        .from('coach_branches')
        .select('coach_id, branch_id')
        .in(
          'coach_id',
          coachList.map((c) => c.id),
        )
      const map = new Map<string, string[]>()
      for (const row of (data ?? []) as { coach_id: string; branch_id: string }[]) {
        const cur = map.get(row.coach_id) ?? []
        cur.push(row.branch_id)
        map.set(row.coach_id, cur)
      }
      setCoachBranchMap(map)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const toggleActive = async (profile: UserProfile) => {
    setActioningId(profile.id)
    const { error } = profile.is_active
      ? await deactivateUser(profile.id)
      : await reactivateUser(profile.id)
    if (!error) {
      setCoaches((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_active: !p.is_active } : p)),
      )
    }
    setActioningId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Antrenörler"
        description={`${coaches.length} onaylı antrenör hesabı`}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : coaches.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Henüz antrenör yok"
          description="Yeni antrenörler kayıt olup onaylandığında burada görünecek."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {coaches.map((c) => {
            const assignedIds = coachBranchMap.get(c.id) ?? []
            const assignedBranches = assignedIds
              .map((id) => branchById.get(id))
              .filter((b): b is Branch => !!b)

            return (
              <Card key={c.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-bold text-secondary">
                          {c.full_name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
                          {c.full_name || 'İsimsiz'}
                        </h3>
                        <Badge variant={c.is_active ? 'success' : 'warning'}>
                          {c.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-body-sm text-on-surface/60">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-on-surface/40" />
                          <span className="truncate">{c.email}</span>
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-on-surface/40" />
                            {c.phone}
                          </span>
                        )}
                      </div>
                      <span className="text-body-sm text-on-surface/40">
                        Kayıt: {formatDateLong(c.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
                      <Pencil className="w-4 h-4" />
                      Düzenle
                    </Button>
                    <Button
                      variant={c.is_active ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => toggleActive(c)}
                      loading={actioningId === c.id}
                    >
                      {c.is_active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                    </Button>
                  </div>
                </div>

                {/* Branş atama satırı */}
                <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-surface-low/50">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Building2 className="w-4 h-4 text-on-surface/40 shrink-0" />
                    {assignedBranches.length === 0 ? (
                      <span className="text-body-sm text-on-surface/50">
                        Henüz branşa atanmamış
                      </span>
                    ) : (
                      assignedBranches.map((b) => (
                        <Badge key={b.id} variant="secondary">
                          {b.name}
                        </Badge>
                      ))
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingBranches(c)}
                    disabled={branches.length === 0}
                  >
                    Branşları Düzenle
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <EditProfileModal
        profile={editing}
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setCoaches((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }}
      />

      {editingBranches && (
        <CoachBranchesModal
          coach={editingBranches}
          branches={branches}
          assignedIds={coachBranchMap.get(editingBranches.id) ?? []}
          onClose={() => setEditingBranches(null)}
          onSaved={async () => {
            setEditingBranches(null)
            await load()
          }}
        />
      )}
    </div>
  )
}

// ─── Branş atama modal ──────────────────────────────────────────────────────

interface CoachBranchesModalProps {
  coach: UserProfile
  branches: Branch[]
  assignedIds: string[]
  onClose: () => void
  onSaved: () => void
}

function CoachBranchesModal({
  coach,
  branches,
  assignedIds,
  onClose,
  onSaved,
}: CoachBranchesModalProps) {
  const { user } = useAuth()
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedIds))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (!user) return
    setIsSubmitting(true)
    setError(null)
    const { error: saveError } = await syncCoachBranches(coach.id, [...selected], user.id)
    setIsSubmitting(false)
    if (saveError) {
      setError(saveError)
      return
    }
    onSaved()
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Branş Atamaları"
      description={coach.full_name ?? coach.email}
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-on-surface/65">
          Bu koç hangi branşlarda öğretebilir? Atanmış branşların yoklamalarını ve
          paketlerini görür/işaretler.
        </p>

        {error && (
          <div className="rounded-lg bg-wine/10 border border-wine/20 px-3 py-2 text-body-sm text-wine">
            {error}
          </div>
        )}

        {branches.length === 0 ? (
          <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-3 text-center">
            Aktif branş yok. Önce <strong>Branşlar</strong> sayfasından branş ekle.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {branches.map((b) => {
              const isOn = selected.has(b.id)
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg p-3 min-h-touch',
                    'transition-colors text-left',
                    isOn
                      ? 'bg-primary text-white'
                      : 'bg-surface-low text-on-surface/80 hover:bg-surface-high',
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-display font-semibold text-body-md">{b.name}</span>
                    <span
                      className={cn(
                        'text-body-sm',
                        isOn ? 'text-white/80' : 'text-on-surface/55',
                      )}
                    >
                      {b.billing_model === 'monthly' ? 'Aylık' : 'Paket'} · {b.code}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                      isOn ? 'border-white bg-white/20' : 'border-on-surface/30',
                    )}
                  >
                    {isOn && (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none">
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

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSubmitting}>
            Kaydet
          </Button>
        </div>
      </div>
    </Modal>
  )
}
