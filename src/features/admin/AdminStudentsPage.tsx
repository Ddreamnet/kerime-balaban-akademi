import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Power,
  PowerOff,
  Search,
  Users,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EditProfileModal } from '@/components/admin/EditProfileModal'
import { EditChildModal } from '@/components/admin/EditChildModal'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import {
  listProfiles,
  deactivateUser,
  reactivateUser,
} from '@/lib/auth'
import { listAllClasses } from '@/lib/classes'
import { listActiveBranches, type Branch } from '@/lib/branches'
import { PageHeader, EmptyState } from '@/components/dashboard'
import type { UserProfile } from '@/types/auth.types'
import type { ClassGroup } from '@/types/content.types'
import { beltLevelLabels, beltLevelColors } from '@/data/classes'
import { cn } from '@/utils/cn'

/**
 * Admin: Üyeler — öğrenciler ve veliler birlikte.
 *
 * Kompakt kart tasarımı: belt-renkli ince sol şerit, küçük avatar, tek satır
 * öğrenci başlığı + alt satırda ince veli özeti. Aksiyonlar ikon-buton şeklinde.
 */
export function AdminStudentsPage() {
  const [students, setStudents] = useState<ChildWithParent[]>([])
  const [parents, setParents] = useState<UserProfile[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningParentId, setActioningParentId] = useState<string | null>(null)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [editingChild, setEditingChild] = useState<ChildWithParent | null>(null)
  const [query, setQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const [list, profiles, cls, brs] = await Promise.all([
        listAllChildren(),
        listProfiles({ role: 'parent' }),
        listAllClasses(),
        listActiveBranches(),
      ])
      setStudents(list)
      setParents(profiles)
      setClasses(cls)
      setBranches(brs)
      setIsLoading(false)
    }
    void load()
  }, [])

  const parentById = new Map(parents.map((p) => [p.id, p]))
  const classById = new Map(classes.map((c) => [c.id, c]))
  const branchById = new Map(branches.map((b) => [b.id, b]))
  const parentIdsWithChildren = new Set(students.map((s) => s.parent_id))
  const parentsWithoutChildren = parents.filter((p) => !parentIdsWithChildren.has(p.id))

  // Instant search: ad veya soyada göre, hem öğrenci hem veli isimlerinde.
  const { filteredStudents, filteredParentsOnly } = useMemo(() => {
    let baseStudents = students
    if (branchFilter) {
      baseStudents = students.filter((s) => s.branch_id === branchFilter)
    }
    const q = query.trim().toLocaleLowerCase('tr')
    if (!q) {
      return { filteredStudents: baseStudents, filteredParentsOnly: parentsWithoutChildren }
    }
    const tokens = q.split(/\s+/).filter(Boolean)
    const matches = (...fields: Array<string | null | undefined>) => {
      const haystack = fields.filter(Boolean).join(' ').toLocaleLowerCase('tr')
      return tokens.every((t) => haystack.includes(t))
    }
    return {
      filteredStudents: baseStudents.filter((s) => matches(s.full_name, s.parent_name)),
      filteredParentsOnly: parentsWithoutChildren.filter((p) => matches(p.full_name)),
    }
  }, [query, students, parentsWithoutChildren, branchFilter])

  const totalVisible = filteredStudents.length + filteredParentsOnly.length

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
    <div className="flex flex-col gap-5 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Üyeler"
        description={`${students.length} öğrenci · ${parents.length} veli`}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Öğrenci veya veli adıyla ara..."
          className="w-full rounded-xl bg-surface-card pl-10 pr-10 h-11 text-body-md border border-outline/15 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Aramayı temizle"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-on-surface/45 hover:text-on-surface hover:bg-surface-low flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Branş filter — birden fazla branş varsa göster */}
      {branches.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setBranchFilter('')}
            className={cn(
              'px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors',
              branchFilter === ''
                ? 'bg-primary text-white'
                : 'bg-surface-low text-on-surface/65 hover:bg-surface-high',
            )}
          >
            Tümü
          </button>
          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBranchFilter(b.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors',
                branchFilter === b.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-low text-on-surface/65 hover:bg-surface-high',
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

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
      ) : query.trim() && totalVisible === 0 ? (
        <EmptyState
          icon={Search}
          title="Sonuç bulunamadı"
          description={`"${query}" için eşleşen üye yok.`}
        />
      ) : (
        <>
          {filteredStudents.length > 0 && (
            <section className="flex flex-col gap-2.5">
              {filteredStudents.map((s) => {
                const parent = parentById.get(s.parent_id)
                const parentActive = parent?.is_active ?? s.parent_is_active
                return (
                  <StudentCard
                    key={s.id}
                    student={s}
                    parent={parent ?? null}
                    parentActive={parentActive}
                    classGroup={s.class_group_id ? classById.get(s.class_group_id) ?? null : null}
                    branch={branchById.get(s.branch_id) ?? null}
                    isToggling={actioningParentId === s.parent_id}
                    onEditChild={() => setEditingChild(s)}
                    onEditParent={() => parent && setEditing(parent)}
                    onToggleParentActive={() => toggleActive(s.parent_id, parentActive)}
                  />
                )
              })}
            </section>
          )}

          {filteredParentsOnly.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 mt-1">
                <h2 className="font-display font-semibold text-title-sm text-on-surface">
                  Çocuğu Olmayan Veliler
                </h2>
                <Badge variant="warning">{filteredParentsOnly.length}</Badge>
              </div>

              {filteredParentsOnly.map((p) => (
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

          {!query.trim() && students.length === 0 && parentsWithoutChildren.length > 0 && (
            <Card className="flex items-center gap-3 py-3 px-4">
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

// ─── Belt accent (left strip) ───────────────────────────────────────────────

const BELT_STRIP: Record<string, string> = {
  beyaz: 'bg-gray-200',
  sari: 'bg-yellow-300',
  yesil: 'bg-green-400',
  mavi: 'bg-blue-400',
  kirmizi: 'bg-red-400',
  siyah: 'bg-on-surface',
}

const NEUTRAL_STRIP = 'bg-surface-high'

// ─── Student card ───────────────────────────────────────────────────────────

function StudentCard({
  student,
  parent,
  parentActive,
  classGroup,
  branch,
  isToggling,
  onEditChild,
  onEditParent,
  onToggleParentActive,
}: {
  student: ChildWithParent
  parent: UserProfile | null
  parentActive: boolean
  classGroup: ClassGroup | null
  branch: Branch | null
  isToggling: boolean
  onEditChild: () => void
  onEditParent: () => void
  onToggleParentActive: () => void
}) {
  const stripColor = student.belt_level ? BELT_STRIP[student.belt_level] : NEUTRAL_STRIP
  const beltClass = student.belt_level ? beltLevelColors[student.belt_level] : null

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-ambient-md transition-shadow">
      <div className="flex items-stretch">
        {/* Belt-tinted vertical strip */}
        <div className={cn('w-1 shrink-0', stripColor)} aria-hidden="true" />

        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-2">
          {/* Top row: avatar + name + meta + actions */}
          <div className="flex items-start gap-2.5 h-12">
            <Link
              to={`/admin/ogrenci/${student.id}`}
              className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden"
              aria-label={`${student.full_name} profili`}
            >
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-black text-white text-body-md">
                  {student.full_name[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </Link>

            <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between">
              <div className="flex items-center gap-1.5 min-w-0 h-5">
                <Link
                  to={`/admin/ogrenci/${student.id}`}
                  className="min-h-0 font-display font-semibold text-body-lg !leading-none text-on-surface hover:text-primary transition-colors truncate"
                >
                  {student.full_name}
                </Link>
                {!parentActive && (
                  <span className="inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 shrink-0">
                    Pasif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-body-sm !leading-none text-on-surface/60 min-w-0 h-4">
                {branch && (
                  <span className="inline-flex items-center rounded-full px-1.5 py-px shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-secondary-container text-secondary">
                    {branch.name}
                  </span>
                )}
                {beltClass && student.belt_level && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-px shrink-0',
                      'text-[10px] font-semibold uppercase tracking-wide',
                      beltClass,
                    )}
                  >
                    {beltLevelLabels[student.belt_level]}
                  </span>
                )}
                {classGroup && (
                  <span className="inline-flex items-center gap-1 truncate">
                    <GraduationCap className="w-3 h-3 shrink-0 text-on-surface/45" />
                    <span className="truncate">{classGroup.name}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="self-center flex items-center gap-0.5 shrink-0">
              <IconButton title="Öğrenciyi düzenle" onClick={onEditChild}>
                <Pencil className="w-3.5 h-3.5" />
              </IconButton>
              <Link
                to={`/admin/ogrenci/${student.id}`}
                title="Profili aç"
                aria-label="Profili aç"
                className="min-h-0 w-8 h-8 rounded-md text-on-surface/45 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Parent strip */}
          {parent && (
            <div className="flex items-center gap-2 pt-2 border-t border-surface-low/70 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface/40 shrink-0">
                Veli
              </span>
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
                {student.parent_avatar_url ? (
                  <img
                    src={student.parent_avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-bold text-primary text-[10px]">
                    {student.parent_name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <span className="text-body-sm text-on-surface/75 truncate flex-1 min-w-0">
                {student.parent_name}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <a
                  href={`mailto:${student.parent_email}`}
                  title={student.parent_email}
                  aria-label="E-posta"
                  className="min-h-0 w-7 h-7 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                {student.parent_phone && (
                  <a
                    href={`tel:${student.parent_phone}`}
                    title={student.parent_phone}
                    aria-label="Telefon"
                    className="min-h-0 w-7 h-7 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                <IconButton title="Veliyi düzenle" onClick={onEditParent}>
                  <Pencil className="w-3.5 h-3.5" />
                </IconButton>
                <button
                  type="button"
                  onClick={onToggleParentActive}
                  disabled={isToggling}
                  title={parentActive ? 'Veliyi devre dışı bırak' : 'Veliyi aktifleştir'}
                  aria-label={parentActive ? 'Veliyi devre dışı bırak' : 'Veliyi aktifleştir'}
                  className={cn(
                    'min-h-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-50',
                    parentActive
                      ? 'text-on-surface/50 hover:text-primary hover:bg-primary/5'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
                  )}
                >
                  {parentActive ? (
                    <PowerOff className="w-3.5 h-3.5" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
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
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
          {parent.avatar_url ? (
            <img src={parent.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-primary text-body-md">
              {parent.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 self-stretch flex flex-col justify-between">
          <div className="flex items-center gap-1.5 min-w-0 h-5">
            <h3 className="font-display font-semibold text-body-lg !leading-none text-on-surface truncate">
              {parent.full_name || 'İsimsiz'}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide shrink-0',
                parent.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
              )}
            >
              {parent.is_active ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-body-sm !leading-none text-on-surface/60 min-w-0 h-4">
            <span className="flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 shrink-0 text-on-surface/40" />
              <span className="truncate">{parent.email}</span>
            </span>
            {parent.phone && (
              <span className="flex items-center gap-1 shrink-0">
                <Phone className="w-3 h-3 text-on-surface/40" />
                {parent.phone}
              </span>
            )}
          </div>
        </div>

        <div className="self-center flex items-center gap-0.5 shrink-0">
          <IconButton title="Düzenle" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </IconButton>
          <button
            type="button"
            onClick={onToggleActive}
            disabled={isToggling}
            title={parent.is_active ? 'Veliyi devre dışı bırak' : 'Veliyi aktifleştir'}
            aria-label={parent.is_active ? 'Veliyi devre dışı bırak' : 'Veliyi aktifleştir'}
            className={cn(
              'min-h-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-50',
              parent.is_active
                ? 'text-on-surface/50 hover:text-primary hover:bg-primary/5'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
            )}
          >
            {parent.is_active ? (
              <PowerOff className="w-3.5 h-3.5" />
            ) : (
              <Power className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </Card>
  )
}

// ─── Reusable icon button ───────────────────────────────────────────────────

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="min-h-0 w-7 h-7 rounded-md text-on-surface/50 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  )
}
