import { useEffect, useState } from 'react'
import { Mail, Phone, Users, Pencil } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { EditProfileModal } from '@/components/admin/EditProfileModal'
import { listProfiles, deactivateUser, reactivateUser } from '@/lib/auth'
import type { UserProfile } from '@/types/auth.types'
import { formatDateLong } from '@/utils/format'

/**
 * Admin: Veliler.
 * Lists all parent profiles.
 */
export function AdminParentsPage() {
  const [parents, setParents] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [editing, setEditing] = useState<UserProfile | null>(null)

  const load = async () => {
    setIsLoading(true)
    const list = await listProfiles({ role: 'parent' })
    setParents(list)
    setIsLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const toggleActive = async (profile: UserProfile) => {
    setActioningId(profile.id)
    const { error } = profile.is_active
      ? await deactivateUser(profile.id)
      : await reactivateUser(profile.id)
    if (!error) {
      setParents((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, is_active: !p.is_active } : p))
      )
    }
    setActioningId(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <p className="text-label-md text-primary uppercase tracking-widest">Yönetici Paneli</p>
        <h1 className="font-display text-headline-lg text-on-surface">Veliler</h1>
        <p className="text-body-md text-on-surface/60 mt-1">
          {parents.length} onaylı veli hesabı
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : parents.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center">
            <Users className="w-7 h-7 text-on-surface/40" />
          </div>
          <p className="font-display font-bold text-title-lg text-on-surface">
            Henüz veli yok
          </p>
          <p className="text-body-md text-on-surface/60">
            Yeni veliler kayıt olup onaylandığında burada görünecek.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {parents.map((c) => (
            <Card key={c.id} className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-primary">
                    {c.full_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-title-md text-on-surface truncate">
                      {c.full_name || 'İsimsiz'}
                    </h3>
                    <Badge variant={c.is_active ? 'success' : 'warning'}>
                      {c.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-body-sm text-on-surface/60">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-on-surface/40" />
                      <span className="truncate">{c.email}</span>
                    </span>
                    {c.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-on-surface/40" />
                        {c.phone}
                      </span>
                    )}
                  </div>
                  <span className="text-body-sm text-on-surface/40">
                    Kayıt: {formatDateLong(c.created_at)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(c)}
                >
                  <Pencil className="w-4 h-4" />
                  Düzenle
                </Button>
                <Button
                  variant={c.is_active ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleActive(c)}
                  loading={actioningId === c.id}
                >
                  {c.is_active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditProfileModal
        profile={editing}
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setParents((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          )
        }}
      />
    </div>
  )
}
