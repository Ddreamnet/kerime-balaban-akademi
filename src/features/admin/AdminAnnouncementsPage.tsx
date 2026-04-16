import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Trash2, Plus, Pin, EyeOff, Megaphone } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  listAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type AnnouncementInput,
} from '@/lib/announcements'
import type { Announcement, AnnouncementCategory } from '@/types/content.types'
import {
  announcementCategoryLabels,
  announcementCategoryColors,
} from '@/data/announcements'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

interface FormValues {
  title: string
  excerpt: string
  content: string
  category: AnnouncementCategory
  image_url: string
  is_pinned: boolean
  is_published: boolean
}

const CATEGORIES: AnnouncementCategory[] = ['genel', 'sinav', 'etkinlik', 'duyuru', 'tatil']

export function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listAllAnnouncements()
    setItems(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return
    setDeletingId(id)
    const { error } = await deleteAnnouncement(id)
    if (!error) setItems((prev) => prev.filter((a) => a.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
          <h1 className="font-display text-headline-lg text-on-surface">Duyurular</h1>
          <p className="text-body-md text-on-surface/60 mt-1">
            {items.length} duyuru ({items.filter((a) => a.is_published).length} yayında)
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          Yeni Duyuru
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Megaphone className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz duyuru yok
          </p>
          <p className="text-body-md text-on-surface/60">
            İlk duyurunuzu oluşturmak için üstteki butona tıklayın.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((a) => (
            <Card key={a.id} className={cn(
              'flex flex-col gap-3',
              !a.is_published && 'opacity-60'
            )}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5',
                      'text-label-sm uppercase tracking-widest font-semibold',
                      announcementCategoryColors[a.category]
                    )}
                  >
                    {announcementCategoryLabels[a.category]}
                  </span>
                  {a.is_pinned && (
                    <Badge variant="primary">
                      <Pin className="w-3 h-3 mr-1 inline" />
                      Pinli
                    </Badge>
                  )}
                  {!a.is_published && (
                    <Badge variant="warning">
                      <EyeOff className="w-3 h-3 mr-1 inline" />
                      Taslak
                    </Badge>
                  )}
                  <span className="text-label-sm text-on-surface/40">
                    {formatDateLong(a.published_at)}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(a.id)}
                    loading={deletingId === a.id}
                    className="text-primary hover:bg-primary/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-display text-title-lg text-on-surface">{a.title}</h3>
              <p className="text-body-md text-on-surface/70 line-clamp-2">{a.excerpt}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create modal */}
      <AnnouncementFormModal
        isOpen={isCreating || editing !== null}
        existing={editing}
        onClose={() => {
          setEditing(null)
          setIsCreating(false)
        }}
        onSaved={() => {
          setEditing(null)
          setIsCreating(false)
          void load()
        }}
      />
    </div>
  )
}

// ─── Form modal ─────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean
  existing: Announcement | null
  onClose: () => void
  onSaved: () => void
}

function AnnouncementFormModal({ isOpen, existing, onClose, onSaved }: FormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: existing?.title ?? '',
      excerpt: existing?.excerpt ?? '',
      content: existing?.content ?? '',
      category: existing?.category ?? 'genel',
      image_url: existing?.image_url ?? '',
      is_pinned: existing?.is_pinned ?? false,
      is_published: existing?.is_published ?? true,
    },
    values: isOpen
      ? {
          title: existing?.title ?? '',
          excerpt: existing?.excerpt ?? '',
          content: existing?.content ?? '',
          category: existing?.category ?? 'genel',
          image_url: existing?.image_url ?? '',
          is_pinned: existing?.is_pinned ?? false,
          is_published: existing?.is_published ?? true,
        }
      : undefined,
  })

  const category = watch('category')
  const isPinned = watch('is_pinned')
  const isPublished = watch('is_published')

  const onSubmit = async (data: FormValues) => {
    const payload: AnnouncementInput = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      image_url: data.image_url || null,
      is_pinned: data.is_pinned,
      is_published: data.is_published,
    }

    const { error } = existing
      ? await updateAnnouncement(existing.id, payload)
      : await createAnnouncement(payload)

    if (error) {
      setError('root', { message: error })
      return
    }

    reset()
    onSaved()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? 'Duyuruyu düzenle' : 'Yeni duyuru'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Başlık"
          type="text"
          placeholder="Duyuru başlığı"
          error={errors.title?.message}
          {...register('title', { required: 'Başlık gereklidir.' })}
        />

        <Textarea
          label="Özet"
          placeholder="Anasayfada gösterilecek kısa özet"
          rows={2}
          error={errors.excerpt?.message}
          {...register('excerpt', {
            required: 'Özet gereklidir.',
            maxLength: { value: 300, message: 'En fazla 300 karakter.' },
          })}
        />

        <Textarea
          label="İçerik"
          placeholder="Tam içerik"
          rows={6}
          error={errors.content?.message}
          {...register('content', { required: 'İçerik gereklidir.' })}
        />

        {/* Category chips */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">Kategori</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('category', c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-label-md uppercase tracking-widest font-semibold transition-all',
                  category === c
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-on-surface/60 hover:bg-surface-high'
                )}
              >
                {announcementCategoryLabels[c]}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Görsel URL (opsiyonel)"
          type="url"
          placeholder="https://..."
          error={errors.image_url?.message}
          {...register('image_url')}
        />

        {/* Toggles */}
        <div className="flex flex-col gap-2">
          <ToggleRow
            label="Pinli"
            description="Pinli duyurular öne çıkarılır."
            checked={isPinned}
            onChange={(v) => setValue('is_pinned', v)}
          />
          <ToggleRow
            label="Yayında"
            description="Kapatılırsa taslak olarak saklanır."
            checked={isPublished}
            onChange={(v) => setValue('is_published', v)}
          />
        </div>

        {errors.root && (
          <p className="text-body-sm text-primary bg-primary-container rounded-md px-3 py-2" role="alert">
            {errors.root.message}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="flex-1">
            {existing ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 bg-surface-low rounded-md p-3 text-left hover:bg-surface-high transition-colors"
    >
      <div>
        <p className="font-display font-semibold text-body-md text-on-surface">{label}</p>
        <p className="text-body-sm text-on-surface/50">{description}</p>
      </div>
      <div
        className={cn(
          'w-10 h-6 rounded-full relative transition-colors shrink-0',
          checked ? 'bg-primary' : 'bg-on-surface/20'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </div>
    </button>
  )
}
