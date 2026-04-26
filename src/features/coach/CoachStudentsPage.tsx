import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ChevronRight, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { listChildIdsForCoach } from '@/lib/assignments'
import { useAuth } from '@/hooks/useAuth'
import { beltLevelLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'

/**
 * Coach: all students list.
 * Click a student to view/edit their basic info (name, avatar).
 */
export function CoachStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClassId, setFilterClassId] = useState<string | 'all'>('all')

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    void (async () => {
      setIsLoading(true)
      const [list, cls, myChildIds] = await Promise.all([
        listAllChildren(),
        listActiveClasses(),
        listChildIdsForCoach(user.id),
      ])
      if (cancelled) return
      setStudents(list.filter((s) => myChildIds.has(s.id)))
      setClasses(cls)
      setIsLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const visible = students.filter((s) => {
    if (filterClassId !== 'all' && s.class_group_id !== filterClassId) return false
    if (search.trim() && !s.full_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getClassName = (id: string | null) => {
    if (!id) return null
    return classes.find((c) => c.id === id)?.name ?? null
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title="Öğrenciler"
        description={
          students.length === 0
            ? 'Size henüz öğrenci atanmadı. Yönetici panelinden atama yapılması gerekiyor.'
            : `Size atanmış ${students.length} öğrenci.`
        }
      />


      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğrenci adıyla ara..."
            className="w-full rounded-md bg-surface-card px-4 pl-10 min-h-touch text-body-md border border-outline/15 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filterClassId === 'all'}
            onClick={() => setFilterClassId('all')}
            label="Tümü"
          />
          {classes.map((c) => (
            <FilterChip
              key={c.id}
              active={filterClassId === c.id}
              onClick={() => setFilterClassId(c.id)}
              label={c.name}
            />
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={students.length === 0 ? 'Henüz öğrenciniz yok' : 'Filtrelere uyan öğrenci yok'}
          description={
            students.length === 0
              ? 'Yönetici size öğrenci atadığında burada listelenecek.'
              : 'Arama veya filtreleri temizleyin.'
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((s) => {
            const className = getClassName(s.class_group_id)
            return (
              <Link key={s.id} to={`/antrenor/ogrenci/${s.id}`} className="group">
                <Card hoverable className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    {s.avatar_url ? (
                      <img
                        src={s.avatar_url}
                        alt={s.full_name}
                        className="w-full h-full rounded-xl object-cover"
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
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.belt_level && (
                        <Badge variant="primary">{beltLevelLabels[s.belt_level]}</Badge>
                      )}
                      {className && <Badge variant="secondary">{className}</Badge>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface FilterChipProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterChip({ active, onClick, label }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-body-sm font-semibold transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-primary',
        active
          ? 'bg-primary text-white shadow-primary-glow/20'
          : 'bg-surface-card text-on-surface/60 hover:bg-surface-low hover:text-on-surface shadow-ambient'
      )}
    >
      {label}
    </button>
  )
}
