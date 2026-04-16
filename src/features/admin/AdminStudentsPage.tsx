import { useEffect, useState } from 'react'
import { GraduationCap, User, Phone, Mail, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { beltLevelLabels } from '@/data/classes'
import { formatDateLong } from '@/utils/format'

/**
 * Admin: Öğrenciler — all children across all parents.
 */
export function AdminStudentsPage() {
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const list = await listAllChildren()
      setStudents(list)
      setIsLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Öğrenciler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          {students.length} öğrenci kayıtlı
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz öğrenci yok
          </p>
          <p className="text-body-md text-on-surface/60 max-w-sm">
            Veliler çocuklarını kaydettikçe burada listelenecekler.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((s) => (
            <Card key={s.id} className="flex flex-col gap-4 md:flex-row md:items-start">
              {/* Avatar + child info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
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
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
                      {s.full_name}
                    </h3>
                    {s.belt_level && (
                      <Badge variant="primary">{beltLevelLabels[s.belt_level]}</Badge>
                    )}
                  </div>
                  {s.birthday && (
                    <span className="flex items-center gap-1.5 text-body-sm text-on-surface/50">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDateLong(s.birthday)}
                    </span>
                  )}
                </div>
              </div>

              {/* Parent info */}
              <div className="flex flex-col gap-1 md:min-w-[240px] md:border-l md:border-surface-low md:pl-4">
                <p className="text-label-sm text-on-surface/40 uppercase tracking-widest mb-1">
                  Veli
                </p>
                <div className="flex items-center gap-1.5 text-body-sm text-on-surface">
                  <User className="w-3.5 h-3.5 text-on-surface/40" />
                  <span className="font-semibold truncate">{s.parent_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-body-sm text-on-surface/60">
                  <Mail className="w-3.5 h-3.5 text-on-surface/40" />
                  <span className="truncate">{s.parent_email}</span>
                </div>
                {s.parent_phone && (
                  <div className="flex items-center gap-1.5 text-body-sm text-on-surface/60">
                    <Phone className="w-3.5 h-3.5 text-on-surface/40" />
                    {s.parent_phone}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
