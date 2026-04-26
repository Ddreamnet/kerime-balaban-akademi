import { useEffect, useState, useCallback } from 'react'
import { Check, X, Mail, Phone, Clock, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState } from '@/components/dashboard'
import { listProfiles, approveUser, rejectUser } from '@/lib/auth'
import type { UserProfile } from '@/types/auth.types'
import { ROLE_LABELS } from '@/types/auth.types'
import { formatDateLong } from '@/utils/format'

/**
 * Admin: Approvals queue.
 * Lists profiles where approval_status='pending' and lets admin approve/reject.
 * This is the linchpin of the new registration flow.
 */
export function AdminApprovalsPage() {
  const [pending, setPending] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const list = await listProfiles({ approval_status: 'pending' })
    setPending(list)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleApprove = async (id: string) => {
    setActioningId(id)
    const { error } = await approveUser(id)
    if (!error) setPending((prev) => prev.filter((p) => p.id !== id))
    setActioningId(null)
  }

  const handleReject = async (id: string) => {
    setActioningId(id)
    const { error } = await rejectUser(id)
    if (!error) setPending((prev) => prev.filter((p) => p.id !== id))
    setActioningId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        kicker="Yönetici Paneli"
        title="Onay Bekleyenler"
        description="Yeni kaydolan kullanıcıları inceleyip onaylayın veya reddedin."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : pending.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Onay bekleyen kullanıcı yok"
          description="Yeni kayıtlar burada görünecek. Hepsi temiz!"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((p) => (
            <ApprovalCard
              key={p.id}
              profile={p}
              isActioning={actioningId === p.id}
              onApprove={() => handleApprove(p.id)}
              onReject={() => handleReject(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ApprovalCardProps {
  profile: UserProfile
  isActioning: boolean
  onApprove: () => void
  onReject: () => void
}

function ApprovalCard({ profile, isActioning, onApprove, onReject }: ApprovalCardProps) {
  return (
    <Card className="flex flex-col gap-4 md:flex-row md:items-center">
      {/* Identity */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-primary">
            {profile.full_name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
              {profile.full_name || 'İsimsiz'}
            </h3>
            <Badge variant={profile.role === 'coach' ? 'secondary' : 'default'}>
              {ROLE_LABELS[profile.role]}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-body-sm text-on-surface/60">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-on-surface/40" />
              <span className="truncate">{profile.email}</span>
            </span>
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-on-surface/40" />
                {profile.phone}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-body-sm text-on-surface/40">
            <Clock className="w-3.5 h-3.5" />
            {formatDateLong(profile.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 md:shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReject}
          disabled={isActioning}
          className="flex-1 md:flex-none border-primary/20 text-primary hover:bg-primary/5"
        >
          <X className="w-4 h-4" />
          Reddet
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onApprove}
          loading={isActioning}
          className="flex-1 md:flex-none"
        >
          <Check className="w-4 h-4" />
          Onayla
        </Button>
      </div>
    </Card>
  )
}
