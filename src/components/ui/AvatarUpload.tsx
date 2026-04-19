import { useState } from 'react'
import { Camera as CameraIcon, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { Camera, isNativePlatform } from '@/lib/capacitor'
import { uploadAvatar } from '@/lib/storage'
import { cn } from '@/utils/cn'

interface AvatarUploadProps {
  /** Currently saved avatar URL (or null for initials fallback) */
  value: string | null
  /** User/child id — used as Supabase Storage path prefix */
  ownerId: string
  /** Shown as initial letter when no image */
  fallbackLabel: string
  /** Called after successful upload with the new public URL */
  onChange: (url: string | null) => void
  /** Size in tailwind classes, e.g. 'w-20 h-20' */
  className?: string
  /** Allow removing current avatar */
  allowRemove?: boolean
}

/**
 * Tap-to-replace avatar with camera/gallery action sheet.
 *
 * Native: Capacitor Camera shows a native prompt (Camera | Photos).
 * Web: falls back to a menu with a hidden <input type="file">.
 */
export function AvatarUpload({
  value,
  ownerId,
  fallbackLabel,
  onChange,
  className,
  allowRemove = true,
}: AvatarUploadProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePick = async (source: 'camera' | 'gallery' | 'prompt') => {
    setMenuOpen(false)
    setError(null)
    setBusy(true)
    try {
      const granted = await Camera.requestPermission()
      if (!granted) {
        setError('Kamera/galeri izni verilmedi.')
        return
      }

      const picked = await Camera.pickImage(source)
      if (!picked) return

      const { url, error: upErr } = await uploadAvatar(ownerId, picked.dataUrl, picked.format)
      if (upErr || !url) {
        setError(upErr ?? 'Yükleme başarısız.')
        return
      }
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = () => {
    setMenuOpen(false)
    onChange(null)
  }

  // On native, the OS shows its own action sheet — skip our custom menu.
  const onAvatarClick = () => {
    if (busy) return
    if (isNativePlatform()) {
      void handlePick('prompt')
    } else {
      setMenuOpen((v) => !v)
    }
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={onAvatarClick}
        disabled={busy}
        className={cn(
          'group relative w-20 h-20 rounded-2xl overflow-hidden',
          'bg-gradient-primary flex items-center justify-center',
          'focus-visible:outline-2 focus-visible:outline-primary',
          'transition-transform active:scale-95',
          busy && 'opacity-70',
        )}
        aria-label="Profil fotoğrafını değiştir"
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-display font-black text-white text-2xl">
            {fallbackLabel[0]?.toUpperCase() ?? '?'}
          </span>
        )}

        {/* Overlay on hover / always visible on mobile */}
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-on-surface/40 text-white',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            busy && 'opacity-100',
          )}
          aria-hidden="true"
        >
          {busy ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <CameraIcon className="w-6 h-6" />
          )}
        </span>
      </button>

      <span className="text-label-sm text-on-surface/60">
        {busy ? 'Yükleniyor…' : 'Fotoğrafa dokun'}
      </span>

      {error && (
        <span role="alert" className="text-label-sm text-primary">
          {error}
        </span>
      )}

      {/* Web-only picker menu */}
      {menuOpen && !isNativePlatform() && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className={cn(
              'absolute top-full mt-2 z-50 min-w-[200px]',
              'bg-surface-card rounded-xl shadow-ambient-lg border border-outline/10',
              'p-1 flex flex-col animate-scale-in',
            )}
          >
            <MenuItem icon={CameraIcon} onClick={() => handlePick('camera')}>
              Kamera ile Çek
            </MenuItem>
            <MenuItem icon={ImageIcon} onClick={() => handlePick('gallery')}>
              Galeriden Seç
            </MenuItem>
            {allowRemove && value && (
              <MenuItem icon={Trash2} onClick={handleRemove} tone="danger">
                Fotoğrafı Kaldır
              </MenuItem>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  onClick,
  children,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  children: React.ReactNode
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-md text-left',
        'hover:bg-surface-low transition-colors',
        tone === 'danger' ? 'text-primary' : 'text-on-surface',
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {children}
    </button>
  )
}
