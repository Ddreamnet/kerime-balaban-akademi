import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCheck,
  UserCog,
  Medal,
  ChevronRight,
  UserPlus,
  Wallet,
  Sparkles,
} from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, StatCard, PanelCard } from '@/components/dashboard'
import { listProfiles } from '@/lib/auth'
import { listAllChildren } from '@/lib/children'
import { listUnassignedChildIds } from '@/lib/assignments'
import { listChildrenWithoutBilling } from '@/lib/payments'
import { useAuth } from '@/hooks/useAuth'

interface UnconfiguredChild {
  id: string
  full_name: string
}

interface Stats {
  pending: number
  coaches: number
  students: number
  unassigned: number
  unbilledChildren: UnconfiguredChild[]
}

/**
 * Admin overview — lightweight stat cards + shortcuts to key actions.
 * Pending approvals and unbilled students surface as spotlight alerts.
 */
export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const load = async () => {
      const [pendingList, coaches, children, unassigned, unbilled] = await Promise.all([
        listProfiles({ approval_status: 'pending' }),
        listProfiles({ role: 'coach', approval_status: 'approved' }),
        listAllChildren(),
        listUnassignedChildIds(),
        listChildrenWithoutBilling(),
      ])
      setStats({
        pending: pendingList.length,
        coaches: coaches.length,
        students: children.length,
        unassigned: unassigned.size,
        unbilledChildren: unbilled.map((c) => ({ id: c.id, full_name: c.full_name })),
      })
    }
    void load()
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title={`Merhaba${firstName ? `, ${firstName}` : ''}`}
        titleAccent={<span className="text-2xl">👋</span>}
        description="Akademinin günlük durumuna hızlıca göz atın."
        decorated
      />

      {!stats ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Pending approvals — spotlight when present */}
          {stats.pending > 0 && (
            <StatCard
              icon={UserCheck}
              label="Onay Bekleyenler"
              value={stats.pending}
              caption="İncelemeniz bekleniyor"
              spotlight
              to="/admin/onaylar"
            />
          )}

          {/* Operational alerts (amber) */}
          {(stats.unassigned > 0 || stats.unbilledChildren.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.unassigned > 0 && (
                <Link to="/admin/atamalar" className="block group">
                  <AlertCard
                    icon={UserPlus}
                    label="Antrenörü Olmayan Öğrenci"
                    value={stats.unassigned}
                    actionLabel="Ata"
                  />
                </Link>
              )}

              {stats.unbilledChildren.length > 0 && (
                <UnbilledAlertCard children={stats.unbilledChildren} />
              )}
            </div>
          )}

          {/* Primary stats — side by side on every breakpoint */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatCard
              icon={Medal}
              label="Öğrenciler"
              value={stats.students}
              tone="primary"
              to="/admin/uyeler"
            />
            <StatCard
              icon={UserCog}
              label="Antrenörler"
              value={stats.coaches}
              tone="secondary"
              to="/admin/antrenorler"
            />
          </div>

          {/* Empty-state hint when there's nothing to triage — wine "premium quiet" feel */}
          {stats.pending === 0 &&
            stats.unassigned === 0 &&
            stats.unbilledChildren.length === 0 && (
              <PanelCard
                tone="elite"
                decorated
                className="flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-white/12 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-white">
                    Bekleyen iş yok
                  </p>
                  <p className="text-body-sm text-white/80">
                    Tüm onay, atama ve ödeme planları güncel. Harika gidiyor!
                  </p>
                </div>
              </PanelCard>
            )}
        </>
      )}
    </div>
  )
}

// ─── Inline alert cards ─────────────────────────────────────────────────────

interface AlertCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  actionLabel: string
}

function AlertCard({ icon: Icon, label, value, actionLabel }: AlertCardProps) {
  return (
    <PanelCard
      padding="md"
      className="bg-warning-tint border border-warning-container/60 hover:border-warning-container transition-colors"
      hoverable
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-warning-container text-warning flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-label-md uppercase tracking-widest text-warning-on-container/80">
              {label}
            </p>
            <p className="font-display font-black text-3xl leading-none mt-0.5 text-warning-on-container">
              {value}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-body-md font-semibold text-warning-on-container">
          <span className="hidden sm:inline">{actionLabel}</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </PanelCard>
  )
}

function UnbilledAlertCard({ children }: { children: UnconfiguredChild[] }) {
  return (
    <PanelCard className="bg-warning-tint border border-warning-container/60">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-warning-container text-warning flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-label-md uppercase tracking-widest text-warning-on-container/80">
              Ödeme Planı Eksik
            </p>
            <span className="font-display font-black text-2xl leading-none text-warning-on-container">
              {children.length}
            </span>
          </div>
          <p className="text-body-sm text-warning-on-container/85 mt-1">
            Aşağıdaki öğrenciler için aylık ödeme planı henüz girilmedi.
          </p>
          <ul className="flex flex-col gap-0.5 mt-2">
            {children.slice(0, 4).map((child) => (
              <li key={child.id}>
                <Link
                  to={`/admin/ogrenci/${child.id}`}
                  className="inline-flex items-center gap-1 text-body-sm font-semibold text-warning-on-container hover:text-primary transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  {child.full_name}
                </Link>
              </li>
            ))}
            {children.length > 4 && (
              <li className="text-body-sm text-warning-on-container/60 pl-4">
                ve {children.length - 4} öğrenci daha…
              </li>
            )}
          </ul>
        </div>
      </div>
    </PanelCard>
  )
}
