import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Notebook,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { listActiveClasses } from '@/lib/classes'
import {
  getRecentNotes,
  createNote,
  deleteNote,
  NOTE_CATEGORY_LABELS,
  NOTE_CATEGORY_COLORS,
  type StudentNote,
  type NoteCategory,
} from '@/lib/studentNotes'
import type { ClassGroup } from '@/types/content.types'
import { cn } from '@/utils/cn'
import { formatDateLong } from '@/utils/format'

interface NoteFormValues {
  child_id: string
  category: NoteCategory
  title: string
  body: string
  rating: string
  note_date: string
}

export function CoachNotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<StudentNote[]>([])
  const [children, setChildren] = useState<ChildWithParent[]>([])
  const [classes, setClasses] = useState<ClassGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all')
  const [filterChildId, setFilterChildId] = useState<string | 'all'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    defaultValues: {
      category: 'genel',
      note_date: new Date().toISOString().split('T')[0],
      rating: '',
    },
  })

  const load = async () => {
    setIsLoading(true)
    const [n, ch, cls] = await Promise.all([
      getRecentNotes(100),
      listAllChildren(),
      listActiveClasses(),
    ])
    setNotes(n)
    setChildren(ch)
    setClasses(cls)
    setIsLoading(false)
  }

  useEffect(() => { void load() }, [])

  const childNameMap = useMemo(() => {
    const map = new Map<string, string>()
    children.forEach((c) => map.set(c.id, c.full_name))
    return map
  }, [children])

  const classNameMap = useMemo(() => {
    const map = new Map<string, string>()
    classes.forEach((c) => map.set(c.id, c.name))
    return map
  }, [classes])

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (filterCategory !== 'all' && n.category !== filterCategory) return false
      if (filterChildId !== 'all' && n.child_id !== filterChildId) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const childName = childNameMap.get(n.child_id) ?? ''
        if (
          !n.title.toLowerCase().includes(q) &&
          !childName.toLowerCase().includes(q) &&
          !(n.body ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [notes, filterCategory, filterChildId, search, childNameMap])

  const onSubmit = async (data: NoteFormValues) => {
    if (!user) return
    const { error } = await createNote(user.id, {
      child_id: data.child_id,
      category: data.category,
      title: data.title,
      body: data.body || null,
      rating: data.rating ? parseInt(data.rating, 10) : null,
      note_date: data.note_date,
    })

    if (error) {
      setError('root', { message: error })
      return
    }

    reset({
      category: 'genel',
      note_date: new Date().toISOString().split('T')[0],
      rating: '',
      child_id: '',
      title: '',
      body: '',
    })
    setShowForm(false)
    void load()
  }

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId)
    const { error } = await deleteNote(noteId)
    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    }
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-label-md text-primary uppercase tracking-widest">Antrenor Paneli</p>
          <h1 className="font-display text-headline-lg text-on-surface">Notlar</h1>
          <p className="text-body-md text-on-surface/60 mt-1">
            Ogrenciler hakkında notlar, performans degerlendirmeleri ve gozlemler.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Yeni Not
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Not veya ogrenci adıyla ara..."
            className="w-full rounded-md bg-surface-card px-4 pl-10 min-h-touch text-body-md border border-outline/15 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={filterCategory === 'all'} onClick={() => setFilterCategory('all')} label="Tumu" />
          {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => (
            <FilterChip
              key={cat}
              active={filterCategory === cat}
              onClick={() => setFilterCategory(cat)}
              label={NOTE_CATEGORY_LABELS[cat]}
            />
          ))}
        </div>

        {children.length > 0 && (
          <select
            value={filterChildId}
            onChange={(e) => setFilterChildId(e.target.value)}
            className="rounded-md bg-surface-card px-3 py-2 text-body-sm border border-outline/15 focus:outline-none focus:border-primary/50 max-w-xs"
          >
            <option value="all">Tum Ogrenciler</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Notebook className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            {notes.length === 0 ? 'Henuz not eklenmemis' : 'Filtrelere uyan not yok'}
          </p>
          <p className="text-body-md text-on-surface/60">
            {notes.length === 0
              ? '"Yeni Not" ile ogrencileriniz hakkında gozlemlerinizi kaydedin.'
              : 'Arama veya filtreleri temizleyin.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotes.map((note) => {
            const childName = childNameMap.get(note.child_id) ?? 'Bilinmeyen'
            const child = children.find((c) => c.id === note.child_id)
            const className = child?.class_group_id
              ? classNameMap.get(child.class_group_id)
              : null

            return (
              <NoteCard
                key={note.id}
                note={note}
                childName={childName}
                className={className ?? null}
                isDeleting={deletingId === note.id}
                onDelete={() => handleDelete(note.id)}
                isOwn={note.coach_id === user?.id}
              />
            )
          })}
        </div>
      )}

      {/* Create note modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Not Ekle">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* Student select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface/80">Ogrenci *</label>
            <select
              {...register('child_id', { required: 'Ogrenci secimi zorunludur.' })}
              className="rounded-md bg-surface-low border border-outline/15 px-3 py-2.5 text-body-md focus:outline-none focus:border-primary/50"
            >
              <option value="">Ogrenci secin...</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
            {errors.child_id && (
              <p className="text-body-sm text-primary">{errors.child_id.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface/80">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(NOTE_CATEGORY_LABELS) as NoteCategory[]).map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={cat}
                    {...register('category')}
                    className="accent-primary"
                  />
                  <span className="text-body-sm">{NOTE_CATEGORY_LABELS[cat]}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Baslik *"
            type="text"
            placeholder="Ornegin: Teknik gelisim gozlendi"
            error={errors.title?.message}
            {...register('title', { required: 'Baslik zorunludur.' })}
          />

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface/80">Aciklama</label>
            <textarea
              {...register('body')}
              rows={3}
              placeholder="Detaylı notunuzu buraya yazın..."
              className="rounded-md bg-surface-low border border-outline/15 px-3 py-2.5 text-body-md focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface/80">
              Puan (istege bagli, 1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <label key={v} className="cursor-pointer">
                  <input
                    type="radio"
                    value={String(v)}
                    {...register('rating')}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-10 rounded-lg border-2 border-outline/15 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary-container transition-colors">
                    <Star className="w-5 h-5 text-on-surface/40 peer-checked:text-primary" />
                    <span className="sr-only">{v}</span>
                  </div>
                  <p className="text-center text-label-sm text-on-surface/50 mt-0.5">{v}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Date */}
          <Input
            label="Tarih"
            type="date"
            {...register('note_date')}
          />

          {errors.root && (
            <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
              {errors.root.message}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setShowForm(false)} className="flex-1">
              Iptal
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="flex-1">
              <Plus className="w-4 h-4" />
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ─── Note card ───────────────────────────────────────────────────────────────

interface NoteCardProps {
  note: StudentNote
  childName: string
  className: string | null
  isDeleting: boolean
  onDelete: () => void
  isOwn: boolean
}

function NoteCard({ note, childName, className, isDeleting, onDelete, isOwn }: NoteCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn('!shadow-none', NOTE_CATEGORY_COLORS[note.category])}
            >
              {NOTE_CATEGORY_LABELS[note.category]}
            </Badge>
            {className && (
              <span className="text-label-sm text-on-surface/40">{className}</span>
            )}
          </div>
          <h3 className="font-display font-bold text-title-md text-on-surface mt-1.5">
            {note.title}
          </h3>
          <p className="text-body-sm text-on-surface/50 mt-0.5">
            {childName} · {formatDateLong(note.note_date)}
          </p>
        </div>

        {note.rating && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-display font-bold text-title-md text-on-surface">
              {note.rating}
            </span>
            <span className="text-label-sm text-on-surface/40">/5</span>
          </div>
        )}
      </div>

      {note.body && (
        <p className="text-body-md text-on-surface/70 leading-relaxed whitespace-pre-line">
          {note.body}
        </p>
      )}

      {isOwn && (
        <div className="flex justify-end pt-1 border-t border-surface-low">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-on-surface/50">Silinsin mi?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Hayır
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onDelete}
                loading={isDeleting}
                className="!bg-primary"
              >
                Evet, Sil
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-3.5 h-3.5" />
              Sil
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

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
          : 'bg-surface-card text-on-surface/60 hover:bg-surface-low hover:text-on-surface shadow-ambient',
      )}
    >
      {label}
    </button>
  )
}
