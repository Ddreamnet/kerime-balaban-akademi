import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Power,
  PowerOff,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { EditProfileModal } from '@/components/admin/EditProfileModal'
import { EditChildModal } from '@/components/admin/EditChildModal'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  listProfiles,
  deactivateUser,
  reactivateUser,
} from '@/lib/auth'
import { listAllClasses } from '@/lib/classes'
import { PageHeader, EmptyState } from '@/components/dashboard'
import type { UserProfile } from '@/types/auth.types'
import type { ClassGroup } from '@/types/content.types'
import { beltLevelLabels, beltLevelColors } from '@/data/classes'
import { cn } from '@/utils/cn'

/**
 * Admin: Üyeler — öğrenciler ve veliler birlikte.
 *
 * Her kart belt-renkli aksent şeritle başlar; öğrenci hero'su, veli bilgi şeridi,
 * eylem satırı tek bir akış halinde. Veli pasif olsa bile kart aktif öğrenciye
 * odaklı kalır; pasif rozeti header'da görünür.
 */
export function AdminStudentsPage() {
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [parents, setParents] = useState<UserProfile[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningParentId, setActioningParentId] = useState<string | null>(null)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [editingChild, setEditingChild] = useState<ChildWithParent | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [list, profiles, cls] = await Promise.all([
        listAllChildren(),
        listProfiles({ role: 'parent' }),
        listAllClasses(),
      ])
      setStudents(list)
      setParents(profiles)
      setClasses(cls)
      setIsLoading(false)
    }
    void load()
  }, [])

  const parentById = new Map(parents.map((p) => [p.id, p]))
  const classById = new Map(classes.map((c) => [c.id, c]))
  const parentIdsWithChildren = new Set(students.map((s) => s.parent_id))
  const parentsWithoutChildren = parents.filter((p) => !parentIdsWithChildren.has(p.id))

  const toggleActive = async (parentId: string, currentlyActive: boolean) => {
    setActioningParentId(parentId)
    const { error } = currentlyActive
      ? await deactivateUser(parentId)
      : await reactivateUser(parentId)
    if (!error) {
      setParents((prev) =>
        prev.map((p) => (p.id === parentId ? { ...p, is_active: !currentlyActive } : p)),
      )
      setStudents((prev) =>
        prev.map((s) =>
          s.parent_id === parentId ? { ...s, parent_is_active: !currentlyActive } : s,
        ),
      )
    }
    setActioningParentId(null)
  }

  const handleProfileSaved = (updated: UserProfile) => {
    setParents((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setStudents((prev) =>
      prev.map((s) =>
        s.parent_id === updated.id
          ? {
              ...s,
              parent_name: updated.full_name,
              parent_phone: updated.phone ?? null,
              parent_avatar_url: updated.avatar_url ?? null,
              parent_is_active: updated.is_active,
            }
          : s,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Üyeler"
        description={`${students.length} öğrenci · ${parents.length} veli`}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 && parents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Henüz üye yok"
          description="Veliler kayıt olup onaylandıkça burada listelenecekler."
        />
      ) : (
        <>
          {students.length > 0 && (
            <section className="flex flex-col gap-4">
              {students.map((s) => {
                const parent = parentById.get(s.parent_id)
                const parentActive = parent?.is_active ?? s.parent_is_active
                return (
                  <StudentCard
                    key={s.id}
                    student={s}
                    parent={parent ?? null}
                    parentActive={parentActive}
                    classGroup={s.class_group_id ? classById.get(s.class_group_id) ?? null : null}
                    isToggling={actioningParentId === s.parent_id}
                    onEditChild={() => setEditingChild(s)}
                    onEditParent={() => parent && setEditing(parent)}
                    onToggleParentActive={() => toggleActive(s.parent_id, parentActive)}
                  />
                )
              })}
            </section>
          )}

          {parentsWithoutChildren.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mt-2">
                <h2 className="font-display font-semibold text-title-md text-on-surface">
                  Çocuğu Olmayan Veliler
                </h2>
                <Badge variant="warning">{parentsWithoutChildren.length}</Badge>
              </div>
              <p className="text-body-sm text-on-surface/50 -mt-2">
                Henüz çocuk eklememiş veli hesapları.
              </p>

              {parentsWithoutChildren.map((p) => (
                <ParentOnlyCard
                  key={p.id}
                  parent={p}
                  isToggling={actioningParentId === p.id}
                  onEdit={() => setEditing(p)}
                  onToggleActive={() => toggleActive(p.id, p.is_active)}
                />
              ))}
            </section>
          )}

          {students.length === 0 && parentsWithoutChildren.length > 0 && (
            <Card className="flex items-center gap-3 py-4 px-4">
              <GraduationCap className="w-5 h-5 text-on-surface/40 shrink-0" />
              <p className="text-body-sm text-on-surface/60">
                Henüz öğrenci kaydı yok — veliler çocuklarını eklediğinde burada listelenecek.
              </p>
            </Card>
          )}
        </>
      )}

      <EditProfileModal
        profile={editing}
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={handleProfileSaved}
      />

      <EditChildModal
        child={editingChild}
        isOpen={editingChild !== null}
        onClose={() => setEditingChild(null)}
        onSaved={(updated) =>
          setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        }
      />
    </div>
  )
}

// ─── Student card ───────────────────────────────────────────────────────────

/**
 * Belt-tinted accent strip + ring. Tailwind sees these literals at build time
 * because they live in source — no purge issue.
 */
const BELT_ACCENT: Record<
  string,
  { strip: string; ring: string }
> = {
  beyaz:   { strip: 'bg-gray-200',    ring: 'ring-gray-200' },
  sari:    { strip: 'bg-yellow-300',  ring: 'ring-yellow-300' },
  yesil:   { strip: 'bg-green-400',   ring: 'ring-green-300' },
  mavi:    { strip: 'bg-blue-400',    ring: 'ring-blue-300' },
  kirmizi: { strip: 'bg-red-400',     ring: 'ring-red-300' },
  siyah:   { strip: 'bg-on-surface',  ring: 'ring-on-surface/40' },
}

const NEUTRAL_ACCENT = { strip: 'bg-surface-high', ring: 'ring-surface-high' }

function StudentCard({
  student,
  parent,
  parentActive,
  classGroup,
  isToggling,
  onEditChild,
  onEditParent,
  onToggleParentActive,
}: {
  student: ChildWithParent
  parent: UserProfile | null
  parentActive: boolean
  classGroup: ClassGroup | null
  isToggling: boolean
  onEditChild: () => void
  onEditParent: () => void
  onToggleParentActive: () => void
}) {
  const accent = student.belt_level ? BELT_ACCENT[student.belt_level] : NEUTRAL_ACCENT
  const age = student.birthday ? ageFromIso(student.birthday) : null
  const beltClass = student.belt_level ? beltLevelColors[student.belt_level] : null

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-ambient-md transition-shadow">
      {/* Belt-tinted top strip */}
      <div className={cn('h-1.5 w-full', accent.strip)} />

      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* Left: student */}
        <div className="flex-1 min-w-0 p-4 flex items-start gap-3">
          <Link
            to={`/admin/ogrenci/${student.id}`}
            className={cn(
              'w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden ring-4 ring-offset-2 ring-offset-surface-card',
              accent.ring,
            )}
            aria-label={`${student.full_name} profili`}
          >
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-black text-white text-lg">
                {student.full_name[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </Link>

          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/admin/ogrenci/${student.id}`}
                className="font-display font-bold text-title-lg text-on-surface hover:text-primary transition-colors truncate"
              >
                {student.full_name}
              </Link>
              {!parentActive && <Badge variant="warning">Veli pasif</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {beltClass && student.belt_level && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5',
                    'text-label-sm font-semibold uppercase tracking-widest',
                    beltClass,
                  )}
                >
                  {beltLevelLabels[student.belt_level]}
                </span>
              )}
              {classGroup && (
                <span className="inline-flex items-center gap-1 text-body-sm text-on-surface/65">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {classGroup.name}
                </span>
              )}
              {age !== null && (
                <span className="inline-flex items-center gap-1 text-body-sm text-on-surface/60">
                  <Cake className="w-3.5 h-3.5" />
                  {age} yaş
                </span>
              )}
              {student.gender && (
                <span className="text-body-sm text-on-surface/55">
                  {student.gender === 'kiz' ? 'Kız' : 'Erkek'}
                </span>
              )}
            </div>

            {/* Action row */}
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <Link
                to={`/admin/ogrenci/${student.id}`}
                className="inline-flex items-center gap-1 px-3 h-8 rounded-md bg-primary text-white text-body-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Profil
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onEditChild}
                className="inline-flex items-center gap-1 px-2.5 h-8 rounded-md text-body-sm font-semibold text-on-surface/65 hover:text-primary hover:bg-primary/5 transition-colors"
                title="Öğrenciyi düzenle"
              >
                <Pencil className="w-3.5 h-3.5" />
                Düzenle
              </button>
            </div>
          </div>
        </div>

        {/* Right: parent (compact) */}
        {parent && (
          <div
            className={cn(
              'md:w-72 md:shrink-0 md:border-l md:border-surface-low',
              'bg-surface-low/50 md:bg-transparent',
              'p-3 md:p-4 flex flex-col gap-2',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-label-sm uppercase tracking-wider text-on-surface/45">
                Veli
              </span>
              <button
                type="button"
                onClick={onToggleParentActive}
                disabled={isToggling}
                className={cn(
                  'inline-flex items-center gap-1 px-2 h-7 rounded-md text-body-sm font-semibold transition-colors disabled:opacity-50',
                  parentActive
                    ? 'text-on-surface/45 hover:text-primary hover:bg-primary/5'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
                )}
                title={parentActive ? 'Veliyi devre dışı bırak' : 'Veliyi aktifleştir'}
              >
                {parentActive ? (
                  <PowerOff className="w-3.5 h-3.5" />
                ) : (
                  <Power className="w-3.5 h-3.5" />
                )}
                {!parentActive && <span>Aktifleştir</span>}
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                {student.parent_avatar_url ? (
                  <img
                    src={student.parent_avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-bold text-primary text-body-sm">
                    {student.parent_name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-display font-semibold text-body-sm text-on-surface truncate">
                  {student.parent_name}
                </span>
                <span className="text-body-sm text-on-surface/55 truncate">
                  {student.parent_email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`mailto:${student.parent_email}`}
                title={student.parent_email}
                aria-label="Veliye e-posta"
                className="w-8 h-8 rounded-md text-on-surface/55 hover:text-primary hover:bg-white flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              {student.parent_phone && (
                <a
                  href={`tel:${student.parent_phone}`}
                  title={student.parent_phone}
                  aria-label="Veliyi ara"
                  className="w-8 h-8 rounded-md text-on-surface/55 hover:text-primary hover:bg-white flex items-center justify-center transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={onEditParent}
                className="ml-auto inline-flex items-center gap-1 px-2 h-8 rounded-md text-body-sm font-semibold text-on-surface/55 hover:text-primary hover:bg-white transition-colors"
                title="Veliyi düzenle"
              >
                <Pencil className="w-3.5 h-3.5" />
                Düzenle
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Parent-only card ───────────────────────────────────────────────────────

function ParentOnlyCard({
  parent,
  isToggling,
  onEdit,
  onToggleActive,
}: {
  parent: UserProfile
  isToggling: boolean
  onEdit: () => void
  onToggleActive: () => void
}) {
  return (
    <Card className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
          {parent.avatar_url ? (
            <img
              src={parent.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-bold text-primary">
              {parent.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-body-lg text-on-surface truncate">
              {parent.full_name || 'İsimsiz'}
            </h3>
            <Badge variant={parent.is_active ? 'success' : 'warning'}>
              {parent.is_active ? 'Aktif' : 'Pasif'}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-body-sm text-on-surface/60">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-on-surface/40 shrink-0" />
              <span className="truncate">{parent.email}</span>
            </span>
            {parent.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-on-surface/40 shrink-0" />
                {parent.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:shrink-0">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
          Düzenle
        </Button>
        <Button
          variant={parent.is_active ? 'secondary' : 'primary'}
          size="sm"
          onClick={onToggleActive}
          loading={isToggling}
        >
          {parent.is_active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
        </Button>
      </div>
    </Card>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ageFromIso(iso: string): number {
  const b = new Date(iso)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
