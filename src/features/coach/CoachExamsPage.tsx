import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Award,
  Calendar,
  Check,
  X,
  Users,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader } from '@/components/dashboard'
import {
  listPublishedExams,
  listResultsForExam,
  scoreResult,
  type Exam,
  type ExamResultWithChild,
} from '@/lib/exams'
import { useAuth } from '@/hooks/useAuth'
import { beltLevelLabels } from '@/data/classes'
import type { BeltLevel } from '@/types/content.types'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

interface ScoreFormValues {
  passed: 'true' | 'false'
  new_belt: BeltLevel | ''
  technical_score: string
  attitude_score: string
  notes: string
}

/**
 * Coach: list exams and score students.
 * Click an exam → opens student list → click a student → score them.
 */
export function CoachExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const list = await listPublishedExams()
      setExams(list)
      setIsLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Antrenör Paneli"
        title="Sınavlar"
        description="Bir sınav seçin ve öğrencilere kuşak terfi puanını verin."
      />


      {selectedExam ? (
        <ExamScoringView exam={selectedExam} onBack={() => setSelectedExam(null)} />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Award className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Aktif sınav yok
          </p>
          <p className="text-body-md text-on-surface/60">
            Yönetici sınav planladığında burada görünecek.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {exams.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedExam(e)}
              className="group text-left"
            >
              <Card hoverable className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
                    {e.title}
                  </h3>
                  <p className="text-body-sm text-on-surface/60 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateLong(e.exam_date)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Scoring view ────────────────────────────────────────────────────────────

function ExamScoringView({ exam, onBack }: { exam: Exam; onBack: () => void }) {
  const [results, setResults] = useState<ExamResultWithChild[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scoring, setScoring] = useState<ExamResultWithChild | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listResultsForExam(exam.id)
    setResults(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id])

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-body-sm text-on-surface/60 hover:text-primary w-fit -mt-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Sınavlar
      </button>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-primary-glow/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-headline-sm text-on-surface">
              {exam.title}
            </h2>
            <p className="text-body-md text-on-surface/60 flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4" />
              {formatDateLong(exam.exam_date)}
            </p>
            {exam.description && (
              <p className="text-body-sm text-on-surface/60 mt-2">{exam.description}</p>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : results.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <Users className="w-10 h-10 text-on-surface/30" />
          <p className="font-display font-bold text-title-lg text-on-surface">
            Öğrenci kayıtlı değil
          </p>
          <p className="text-body-md text-on-surface/60 max-w-sm">
            Yönetici bu sınava öğrenci eklediğinde puanlayabilirsiniz.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => setScoring(r)}
              className="group text-left"
            >
              <Card
                hoverable
                padding="sm"
                className={cn(
                  'flex items-center gap-3 border-l-4',
                  r.passed === true && 'border-l-green-500',
                  r.passed === false && 'border-l-primary',
                  r.passed === null && 'border-l-surface-low',
                )}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                  {r.child_avatar_url ? (
                    <img src={r.child_avatar_url} alt={r.child_full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-white text-sm">
                      {r.child_full_name[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-body-md text-on-surface truncate">
                    {r.child_full_name}
                  </h4>
                  {r.child_belt_level && (
                    <p className="text-body-sm text-on-surface/50">
                      Mevcut: {beltLevelLabels[r.child_belt_level]}
                    </p>
                  )}
                </div>
                {r.passed === true && <Badge variant="success">Geçti</Badge>}
                {r.passed === false && <Badge variant="error">Kaldı</Badge>}
                {r.passed === null && <Badge variant="default">Puanla</Badge>}
                <ChevronRight className="w-4 h-4 text-on-surface/30 group-hover:text-primary transition-all" />
              </Card>
            </button>
          ))}
        </div>
      )}

      {scoring && (
        <ScoreStudentModal
          result={scoring}
          onClose={() => setScoring(null)}
          onSaved={async () => {
            await load()
            setScoring(null)
          }}
        />
      )}
    </>
  )
}

// ─── Score modal ─────────────────────────────────────────────────────────────

interface ScoreModalProps {
  result: ExamResultWithChild
  onClose: () => void
  onSaved: () => void
}

function ScoreStudentModal({ result, onClose, onSaved }: ScoreModalProps) {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ScoreFormValues>({
    defaultValues: {
      passed: result.passed === true ? 'true' : result.passed === false ? 'false' : 'true',
      new_belt: result.new_belt ?? '',
      technical_score: result.technical_score?.toString() ?? '',
      attitude_score: result.attitude_score?.toString() ?? '',
      notes: result.notes ?? '',
    },
  })

  const passed = watch('passed')
  const newBelt = watch('new_belt')

  const onSubmit = async (data: ScoreFormValues) => {
    const tech = data.technical_score ? Number(data.technical_score) : null
    const att = data.attitude_score ? Number(data.attitude_score) : null

    const { error } = await scoreResult(
      result.id,
      {
        passed: data.passed === 'true',
        new_belt: (data.new_belt || null) as BeltLevel | null,
        technical_score: tech,
        attitude_score: att,
        notes: data.notes.trim() || null,
      },
      user?.id ?? null,
    )

    if (error) {
      setError('root', { message: error })
      return
    }

    onSaved()
  }

  return (
    <Modal isOpen onClose={onClose} title={result.child_full_name} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Pass/Fail */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md text-on-surface/80 font-medium">Sonuç</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('passed', 'true')}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-lg font-display font-semibold transition-colors',
                passed === 'true'
                  ? 'bg-green-600 text-white'
                  : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
              )}
            >
              <Check className="w-4 h-4" />
              Geçti
            </button>
            <button
              type="button"
              onClick={() => setValue('passed', 'false')}
              className={cn(
                'flex items-center justify-center gap-2 py-3 rounded-lg font-display font-semibold transition-colors',
                passed === 'false'
                  ? 'bg-primary text-white'
                  : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
              )}
            >
              <X className="w-4 h-4" />
              Kaldı
            </button>
          </div>
        </div>

        {/* New belt (only if passed) */}
        {passed === 'true' && (
          <div className="flex flex-col gap-2">
            <span className="text-label-md text-on-surface/80 font-medium">Kazanılan Kuşak</span>
            <div className="grid grid-cols-3 gap-2">
              {(['beyaz', 'sari', 'yesil', 'mavi', 'kirmizi', 'siyah'] as BeltLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setValue('new_belt', lvl)}
                  className={cn(
                    'py-2.5 rounded-lg font-display font-semibold transition-colors',
                    newBelt === lvl
                      ? 'bg-primary text-white'
                      : 'bg-surface-low text-on-surface/60 hover:bg-surface-high',
                  )}
                >
                  {beltLevelLabels[lvl]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Teknik (1-5)"
            type="number"
            min={1}
            max={5}
            placeholder="1-5"
            {...register('technical_score')}
          />
          <Input
            label="Tutum (1-5)"
            type="number"
            min={1}
            max={5}
            placeholder="1-5"
            {...register('attitude_score')}
          />
        </div>

        <Textarea
          label="Notlar (opsiyonel)"
          rows={3}
          placeholder="Sınav notları..."
          {...register('notes')}
        />

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
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  )
}
