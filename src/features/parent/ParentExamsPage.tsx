import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Calendar,
  Check,
  X,
  Baby,
  Star,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/dashboard'
import { useAuth } from '@/hooks/useAuth'
import { getMyChild, type Child } from '@/lib/children'
import { getChildExamHistory, type ExamWithChild } from '@/lib/exams'
import { beltLevelLabels } from '@/data/classes'
import { formatDateLong } from '@/utils/format'
import { cn } from '@/utils/cn'

export function ParentExamsPage() {
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [exams, setExams] = useState<ExamWithChild[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setIsLoading(true)
      const c = await getMyChild(user.id)
      setChild(c)
      if (c) {
        const history = await getChildExamHistory(c.id)
        setExams(history)
      }
      setIsLoading(false)
    }
    void load()
  }, [user])

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        kicker="Veli Paneli"
        title="Sınavlar"
        description="Çocuğunuzun kuşak terfi sınavları ve sonuçları."
      />


      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : !child ? (
        <NoChildCard />
      ) : exams.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Award className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz sınav kaydı yok
          </p>
          <p className="text-body-md text-on-surface/60 max-w-sm">
            Çocuğunuz bir sınava katıldığında sonuçları burada görünecek.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {exams.map((e) => (
            <ExamCard key={e.id} exam={e} />
          ))}
        </div>
      )}
    </div>
  )
}

function NoChildCard() {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
        <Baby className="w-7 h-7 text-on-surface/40" />
      </div>
      <p className="font-display font-bold text-title-lg text-on-surface">
        Önce çocuğunuzu kaydedin
      </p>
      <Link to="/veli/cocugum">
        <Button variant="primary" size="md">
          Çocuğumu Kaydet
        </Button>
      </Link>
    </Card>
  )
}

function ExamCard({ exam }: { exam: ExamWithChild }) {
  const result = exam.result
  const status = result?.passed

  return (
    <Card
      className={cn(
        'border-l-4',
        status === true && 'border-l-green-500 bg-green-50/40',
        status === false && 'border-l-primary bg-red-50/40',
        status == null && 'border-l-surface-low',
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              status === true && 'bg-green-100 text-green-700',
              status === false && 'bg-red-100 text-primary',
              status == null && 'bg-surface-low text-on-surface/40',
            )}
          >
            {status === true ? (
              <Check className="w-6 h-6" />
            ) : status === false ? (
              <X className="w-6 h-6" />
            ) : (
              <Award className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-title-lg text-on-surface">{exam.title}</h3>
            <p className="text-body-sm text-on-surface/60 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateLong(exam.exam_date)}
            </p>
          </div>
          {status === true && <Badge variant="success">Geçti</Badge>}
          {status === false && <Badge variant="error">Kaldı</Badge>}
          {status == null && <Badge variant="default">Beklemede</Badge>}
        </div>

        {/* Success celebration */}
        {status === true && result?.new_belt && (
          <div className="bg-gradient-primary text-white rounded-lg p-4 flex items-center gap-3 shadow-primary-glow/20">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-label-md uppercase tracking-widest text-white/70">
                Yeni Kuşak
              </p>
              <p className="font-display font-black text-headline-sm">
                {beltLevelLabels[result.new_belt]} Kuşak
              </p>
            </div>
          </div>
        )}

        {/* Scores */}
        {(result?.technical_score || result?.attitude_score) && (
          <div className="grid grid-cols-2 gap-2">
            {result.technical_score !== null && (
              <ScoreTile label="Teknik" value={result.technical_score} />
            )}
            {result.attitude_score !== null && (
              <ScoreTile label="Tutum" value={result.attitude_score} />
            )}
          </div>
        )}

        {result?.notes && (
          <p className="text-body-sm text-on-surface/60 italic bg-surface-low rounded-md px-3 py-2">
            "{result.notes}"
          </p>
        )}
      </div>
    </Card>
  )
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 bg-surface-low rounded-lg p-3">
      <Star className="w-4 h-4 text-yellow-600" />
      <div>
        <p className="text-label-sm uppercase tracking-widest text-on-surface/40">{label}</p>
        <p className="font-display font-bold text-body-md text-on-surface">
          {value} / 5
        </p>
      </div>
    </div>
  )
}
