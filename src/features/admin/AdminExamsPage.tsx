import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Pencil,
  Trash2,
  Plus,
  Award,
  UserPlus,
  Calendar,
  MapPin,
  EyeOff,
  X,
  Check,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import {
  listExams,
  createExam,
  updateExam,
  deleteExam,
  listResultsForExam,
  enrollChild,
  unenrollChild,
  type Exam,
  type ExamInput,
  type ExamResultWithChild,
} from '@/lib/exams'
import { listAllChildren, type ChildWithParent } from '@/lib/children'
import { useAuth } from '@/hooks/useAuth'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ExamFormValues {
  title: string
  exam_date: string
  location: string
  description: string
  is_published: boolean
}

export function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [managingExam, setManagingExam] = useState<Exam | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listExams()
    setExams(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sınavı silmek istediğinize emin misiniz? Tüm puanlama kayıtları da silinir.')) return
    setDeletingId(id)
    const { error } = await deleteExam(id)
    if (!error) setExams((prev) => prev.filter((e) => e.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
          <h1 className="font-display text-headline-lg text-on-surface">Sınavlar</h1>
          <p className="text-body-md text-on-surface/60 mt-1">
            {exams.length} sınav · kuşak terfi ve müsabaka hazırlık
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4" />
          Yeni Sınav
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Award className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz sınav yok
          </p>
          <p className="text-body-md text-on-surface/60">
            İlk sınavınızı planlamak için üstteki butonu kullanın.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {exams.map((e) => (
            <Card key={e.id} className={cn('flex flex-col gap-3', !e.is_published && 'opacity-60')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Badge variant="primary">
                    <Calendar className="w-3 h-3 mr-1 inline" />
                    {formatDateLong(e.exam_date)}
                  </Badge>
                  {!e.is_published && (
                    <Badge variant="warning">
                      <EyeOff className="w-3 h-3 mr-1 inline" />
                      Taslak
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(e)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(e.id)}
                    loading={deletingId === e.id}
                    className="text-primary hover:bg-primary/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-display text-title-lg text-on-surface">{e.title}</h3>

              {e.location && (
                <p className="flex items-center gap-1.5 text-body-sm text-on-surface/60">
                  <MapPin className="w-3.5 h-3.5" />
                  {e.location}
                </p>
              )}

              {e.description && (
                <p className="text-body-sm text-on-surface/60 line-clamp-2">{e.description}</p>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setManagingExam(e)}
                className="mt-auto"
              >
                <Users className="w-4 h-4" />
                Öğrenci Yönet
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <ExamFormModal
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

      {/* Manage students modal */}
      {managingExam && (
        <ManageStudentsModal
          exam={managingExam}
          onClose={() => setManagingExam(null)}
        />
      )}
    </div>
  )
}

// ─── Form modal ─────────────────────────────────────────────────────────────

interface FormModalProps {
  isOpen: boolean
  existing: Exam | null
  onClose: () => void
  onSaved: () => void
}

function ExamFormModal({ isOpen, existing, onClose, onSaved }: FormModalProps) {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormValues>({
    values: isOpen
      ? {
          title: existing?.title ?? '',
          exam_date: existing?.exam_date ?? new Date().toISOString().split('T')[0],
          location: existing?.location ?? '',
          description: existing?.description ?? '',
          is_published: existing?.is_published ?? true,
        }
      : undefined,
  })

  const isPublished = watch('is_published')

  const onSubmit = async (data: ExamFormValues) => {
    const payload: ExamInput = {
      title: data.title,
      exam_date: data.exam_date,
      location: data.location.trim() || null,
      description: data.description.trim() || null,
      is_published: data.is_published,
    }

    const { error } = existing
      ? await updateExam(existing.id, payload)
      : await createExam(payload, user?.id ?? null)

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
      title={existing ? 'Sınavı düzenle' : 'Yeni sınav'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Sınav Adı"
          type="text"
          placeholder="Örn. Nisan 2024 Kuşak Sınavı"
          error={errors.title?.message}
          {...register('title', { required: 'Sınav adı gereklidir.' })}
        />

        <Input
          label="Sınav Tarihi"
          type="date"
          error={errors.exam_date?.message}
          {...register('exam_date', { required: 'Tarih gereklidir.' })}
        />

        <Input
          label="Konum (opsiyonel)"
          type="text"
          placeholder="Örn. Akademi Salonu"
          {...register('location')}
        />

        <Textarea
          label="Açıklama (opsiyonel)"
          rows={3}
          placeholder="Sınav hakkında notlar..."
          {...register('description')}
        />

        {/* Published toggle */}
        <button
          type="button"
          onClick={() => setValue('is_published', !isPublished)}
          className="flex items-center justify-between gap-3 bg-surface-low rounded-md p-3 text-left hover:bg-surface-high transition-colors"
        >
          <div>
            <p className="font-display font-semibold text-body-md text-on-surface">Yayında</p>
            <p className="text-body-sm text-on-surface/50">
              Kapalı sınavlar veli panelinde görünmez.
            </p>
          </div>
          <div className={cn('w-10 h-6 rounded-full relative transition-colors shrink-0', isPublished ? 'bg-primary' : 'bg-on-surface/20')}>
            <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', isPublished ? 'translate-x-4' : 'translate-x-0.5')} />
          </div>
        </button>

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

// ─── Manage students modal ─────────────────────────────────────────────────

interface ManageStudentsModalProps {
  exam: Exam
  onClose: () => void
}

function ManageStudentsModal({ exam, onClose }: ManageStudentsModalProps) {
  const [results, setResults] = useState<ExamResultWithChild[]>([])
  const [allChildren, setAllChildren] = useState<ChildWithParent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    const [res, ch] = await Promise.all([listResultsForExam(exam.id), listAllChildren()])
    setResults(res)
    setAllChildren(ch)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id])

  const enrolledIds = new Set(results.map((r) => r.child_id))
  const notEnrolled = allChildren.filter((c) => !enrolledIds.has(c.id))

  const handleEnroll = async (childId: string) => {
    setActioningId(childId)
    await enrollChild(exam.id, childId)
    await load()
    setActioningId(null)
  }

  const handleUnenroll = async (childId: string) => {
    setActioningId(childId)
    await unenrollChild(exam.id, childId)
    await load()
    setActioningId(null)
  }

  return (
    <Modal isOpen onClose={onClose} title={`Öğrenciler — ${exam.title}`} size="lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Enrolled */}
          <div className="flex flex-col gap-2">
            <p className="text-label-md uppercase tracking-widest text-primary">
              Kayıtlı ({results.length})
            </p>
            {results.length === 0 ? (
              <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-3">
                Henüz öğrenci kayıtlı değil.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {results.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-primary-container"
                  >
                    <span className="flex-1 font-display font-semibold text-body-md text-on-surface truncate">
                      {r.child_full_name}
                    </span>
                    {r.passed === true && <Badge variant="success">Geçti</Badge>}
                    {r.passed === false && <Badge variant="error">Kaldı</Badge>}
                    {r.passed === null && <Badge variant="default">Puanlanmadı</Badge>}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnenroll(r.child_id)}
                      loading={actioningId === r.child_id}
                      className="text-primary hover:bg-primary/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add students */}
          <div className="flex flex-col gap-2 border-t border-surface-low pt-4">
            <p className="text-label-md uppercase tracking-widest text-on-surface/50">
              Öğrenci ekle ({notEnrolled.length})
            </p>
            {notEnrolled.length === 0 ? (
              <p className="text-body-sm text-on-surface/50 bg-surface-low rounded-md px-3 py-3">
                Tüm öğrenciler bu sınava kayıtlı.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {notEnrolled.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-low">
                    <span className="flex-1 font-display text-body-md text-on-surface truncate">
                      {c.full_name}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEnroll(c.id)}
                      loading={actioningId === c.id}
                    >
                      <UserPlus className="w-4 h-4" />
                      Ekle
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-5">
        <Button variant="primary" size="md" onClick={onClose}>
          <Check className="w-4 h-4" />
          Tamam
        </Button>
      </div>
    </Modal>
  )
}
