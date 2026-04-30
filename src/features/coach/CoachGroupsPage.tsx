import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import { listActiveClasses } from '@/lib/classes'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { listClassIdsForCoach } from '@/lib/classCoaches'
import { useAuth } from '@/hooks/useAuth'
import { beltLevelLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'

/**
 * Coach: class groups overview.
 * Shows each group with enrolled students, capacity, and schedule.
 * Sadece koç'un atandığı class'lar listelenir (class_coaches scope).
 */
export function CoachGroupsPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [children, setChildren] = useState<ChildWithParent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      setIsLoading(true)
      const [cls, ch, classIds] = await Promise.all([
        listActiveClasses(),
        listAllChildren(),
        listClassIdsForCoach(user.id),
      ])
      const myClassIds = new Set(classIds)
      setClasses(cls.filter((c) => myClassIds.has(c.id)))
      setChildren(ch.filter((s) => s.class_group_id !== null && myClassIds.has(s.class_group_id)))
      setIsLoading(false)
    }
    void load()
  }, [user?.id])

  const childrenByClass = useMemo(() => {
    const map = new Map<string, ChildWithParent[]>()
    children.forEach((c) => {
      if (!c.class_group_id) return
      const list = map.get(c.class_group_id) ?? []
      list.push(c)
      map.set(c.class_group_id, list)
    })
    return map
  }, [children])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title="Gruplar"
        description="Aktif ders grupları ve kayıtlı öğrenciler."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState icon={Users} title="Aktif grup yok" />
      ) : (
        <div className="flex flex-col gap-4">
          {classes.map((cls) => {
            const enrolled = childrenByClass.get(cls.id) ?? []
            const isExpanded = expandedId === cls.id
            const capacityRate = cls.capacity > 0
              ? Math.round((enrolled.length / cls.capacity) * 100)
              : 0
            const capacityColor =
              capacityRate >= 90 ? 'text-primary' :
              capacityRate >= 70 ? 'text-yellow-600' :
              'text-green-600'

            return (
              <Card key={cls.id} className="flex flex-col gap-0 !p-0 overflow-hidden">
                {/* Group header — clickable to expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                  className="flex items-center gap-4 p-4 sm:p-5 text-left w-full hover:bg-surface-low/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-title-lg text-on-surface">
                      {cls.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-body-sm text-on-surface/50">{cls.age_range}</span>
                      <span className="text-on-surface/20">·</span>
                      <span className="flex items-center gap-1 text-body-sm text-on-surface/50">
                        <Clock className="w-3.5 h-3.5" />
                        {cls.time_start} – {cls.time_end}
                      </span>
                      <span className="text-on-surface/20">·</span>
                      <span className={cn('text-body-sm font-semibold', capacityColor)}>
                        {enrolled.length}/{cls.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-display font-black text-2xl text-on-surface leading-none">
                        {enrolled.length}
                      </p>
                      <p className="text-label-sm text-on-surface/40 uppercase tracking-widest">
                        ogrenci
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-5 h-5 text-on-surface/30 transition-transform',
                        isExpanded && 'rotate-90',
                      )}
                    />
                  </div>
                </button>

                {/* Capacity bar */}
                <div className="px-4 sm:px-5 pb-1">
                  <div className="h-1.5 rounded-full bg-surface-low overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        capacityRate >= 90 ? 'bg-primary' :
                        capacityRate >= 70 ? 'bg-yellow-500' :
                        'bg-green-500',
                      )}
                      style={{ width: `${Math.min(capacityRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Expanded student list */}
                {isExpanded && (
                  <div className="border-t border-surface-low mt-2">
                    {enrolled.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <p className="text-body-md text-on-surface/50">
                          Bu grupta henuz ogrenci yok.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-surface-low">
                        {enrolled.map((child) => (
                          <Link
                            key={child.id}
                            to={`/antrenor/ogrenci/${child.id}`}
                            className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-surface-low/50 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                              {child.avatar_url ? (
                                <img
                                  src={child.avatar_url}
                                  alt={child.full_name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="font-display font-bold text-white text-sm">
                                  {child.full_name[0]?.toUpperCase() ?? '?'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-semibold text-body-md text-on-surface truncate">
                                {child.full_name}
                              </p>
                              <p className="text-label-sm text-on-surface/40">
                                {child.parent_name}
                              </p>
                            </div>
                            {child.belt_level && (
                              <Badge variant="primary" className="shrink-0">
                                {beltLevelLabels[child.belt_level]}
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-on-surface/20 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
