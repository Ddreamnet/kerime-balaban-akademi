import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { listAssignableCoaches } from '@/lib/assignments'
import type { UserProfile } from '@/types/auth.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  /** Coach ids already assigned — these are filtered out or marked disabled. */
  excludeIds: string[]
  onPick: (coach: UserProfile) => void
}

export function CoachPickerModal({ isOpen, onClose, excludeIds, onPick }: Props) {
  const [coaches, setCoaches] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setIsLoading(true)
    void listAssignableCoaches().then((list) => {
      if (!cancelled) {
        setCoaches(list)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const available = coaches.filter((c) => !excludeIds.includes(c.id))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Antrenör seç" size="md">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : available.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-body-lg text-on-surface">
            Eklenecek antrenör kalmadı
          </p>
          <p className="text-body-sm text-on-surface/60">
            {coaches.length === 0
              ? 'Aktif antrenör yok. Önce antrenör kaydını onaylayın.'
              : 'Tüm aktif antrenörler zaten atanmış.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {available.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              className="flex items-center gap-3 p-3 rounded-lg text-left hover:bg-surface-low transition-colors min-h-touch focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-secondary">
                    {c.full_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-body-md text-on-surface truncate">
                  {c.full_name}
                </p>
                <p className="text-body-sm text-on-surface/50 truncate">{c.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
