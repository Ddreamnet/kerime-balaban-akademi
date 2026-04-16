import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ChevronRight, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import { beltLevelLabels } from '@/data/classes'
import type { ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'

/**
 * Coach: all students list.
 * Click a student to view/edit their basic info (name, avatar).
 */
export function CoachStudentsPage() {
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClassId, setFilterClassId] = useState<string | 'all'>('all')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [list, cls] = await Promise.all([listAllChildren(), listActiveClasses()])
      setStudents(list)
      setClasses(cls)
      setIsLoading(false)
    }
    void load()
  }, [])

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
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Antrenör Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Öğrenciler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          {students.length} öğrenci kayıtlı. İsimlerini veya profil fotoğraflarını düzenleyebilirsiniz.
        </p>
      </div>

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
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            {students.length === 0 ? 'Henüz öğrenci yok' : 'Filtrelere uyan öğrenci yok'}
          </p>
          <p className="text-body-md text-on-surface/60">
            {students.length === 0
              ? 'Veliler çocuklarını kaydettikçe burada listelenecekler.'
              : 'Arama veya filtreleri temizleyin.'}
          </p>
        </Card>
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
