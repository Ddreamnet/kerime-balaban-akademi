import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, UserCog, Users, GraduationCap, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { listProfiles } from '@/lib/auth'
import { listAllChildren } from '@/lib/children'
import { useAuth } from '@/hooks/useAuth'

interface Stats {
  pending: number
  coaches: number
  parents: number
  students: number
}

/**
 * Admin overview — lightweight stat cards + shortcuts to key actions.
 * Pending approvals are highlighted for quick triage.
 */
export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const load = async () => {
      const [pendingList, coaches, parents, children] = await Promise.all([
        listProfiles({ approval_status: 'pending' }),
        listProfiles({ role: 'coach', approval_status: 'approved' }),
        listProfiles({ role: 'parent', approval_status: 'approved' }),
        listAllChildren(),
      ])
      setStats({
        pending: pendingList.length,
        coaches: coaches.length,
        parents: parents.length,
        students: children.length,
      })
    }
    void load()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">
          Merhaba{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          Akademinin günlük durumuna hızlıca göz atın.
        </p>
      </div>

      {/* Stats grid */}
      {!stats ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Pending spotlight (only if > 0) */}
          {stats.pending > 0 && (
            <Link
              to="/admin/onaylar"
              className="block group"
            >
              <Card className="bg-gradient-to-r from-primary to-primary-gradient text-white border-0 shadow-primary-glow/30 hover:shadow-primary-glow transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-label-md uppercase tracking-widest text-white/70">
                        Onay Bekleyenler
                      </p>
                      <p className="font-display font-black text-3xl leading-tight mt-0.5">
                        {stats.pending}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-body-md font-semibold">
                    <span className="hidden sm:inline">İncele</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatLink
              to="/admin/antrenorler"
              icon={UserCog}
              label="Antrenörler"
              value={stats.coaches}
              accent="secondary"
            />
            <StatLink
              to="/admin/veliler"
              icon={Users}
              label="Veliler"
              value={stats.parents}
              accent="primary"
            />
            <StatLink
              to="/admin/ogrenciler"
              icon={GraduationCap}
              label="Öğrenciler"
              value={stats.students}
              accent="neutral"
            />
          </div>
        </>
      )}
    </div>
  )
}

interface StatLinkProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent: 'primary' | 'secondary' | 'neutral'
}

function StatLink({ to, icon: Icon, label, value, accent }: StatLinkProps) {
  const accentClasses = {
    primary: 'bg-primary-container text-primary',
    secondary: 'bg-secondary-container text-secondary',
    neutral: 'bg-surface-low text-on-surface/60',
  }[accent]

  return (
    <Link to={to} className="group">
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <ChevronRight className="w-4 h-4 text-on-surface/30 group-hover:text-on-surface/60 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-4">
          <p className="text-label-md uppercase tracking-widest text-on-surface/50">
            {label}
          </p>
          <p className="font-display font-black text-3xl text-on-surface mt-1">
            {value}
          </p>
        </div>
      </Card>
    </Link>
  )
}
