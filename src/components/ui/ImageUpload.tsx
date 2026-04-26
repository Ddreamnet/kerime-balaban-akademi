import { useState } from 'react'
import { Camera as CameraIcon, Image as ImageIcon, Trash2, Loader2, ImagePlus } from 'lucide-react'
import { Camera, isNativePlatform } from '@/lib/capacitor'
import { uploadContentImage } from '@/lib/storage'
import { cn } from '@/utils/cn'

interface ImageUploadProps {
  /** Currently saved image URL (or null to show empty placeholder) */
  value: string | null
  /** Sub-folder under the content bucket, e.g. 'announcements' | 'products'. */
  folder: string
  /** Optional label shown above the preview */
  label?: string
  /** Optional helper text shown under the preview */
  hint?: string
  /** Called after successful upload with the new public URL (or null when removed) */
  onChange: (url: string | null) => void
  /** Allow removing current image (defaults to true) */
  allowRemove?: boolean
  className?: string
}

/**
 * Tap-to-replace image picker with a wide rectangular preview.
 *
 * Native: Capacitor Camera shows the OS action sheet (Camera | Photos).
 * Web: falls back to a small menu next to the preview.
 *
 * Use for site content images (announcements, products). For avatars, prefer
 * the dedicated AvatarUpload component.
 */
export function ImageUpload({
  value,
  folder,
  label,
  hint,
  onChange,
  allowRemove = true,
  className,
}: ImageUploadProps) {
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

      const { url, error: upErr } = await uploadContentImage(folder, picked.dataUrl, picked.format)
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

  const onPreviewClick = () => {
    if (busy) return
    if (isNativePlatform()) {
      void handlePick('prompt')
    } else {
      setMenuOpen((v) => !v)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <span className="text-label-md text-on-surface/80 font-medium">{label}</span>}

      <div className="relative">
        <button
          type="button"
          onClick={onPreviewClick}
          disabled={busy}
          className={cn(
            'group relative w-full aspect-[16/9] rounded-md overflow-hidden',
            'flex items-center justify-center',
            'focus-visible:outline-2 focus-visible:outline-primary',
            'transition-transform active:scale-[0.99]',
            value
              ? 'bg-surface-low'
              : 'bg-surface-low border-2 border-dashed border-outline/30 hover:border-primary/50',
            busy && 'opacity-70',
          )}
          aria-label={value ? 'Görseli değiştir' : 'Görsel ekle'}
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-on-surface/50">
              <ImagePlus className="w-7 h-7" />
              <span className="text-body-sm">Görsel ekle</span>
            </div>
          )}

          {/* Overlay (visible on hover or while busy when there's an image) */}
          {value && (
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
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <CameraIcon className="w-7 h-7" />
              )}
            </span>
          )}

          {!value && busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-surface-low/80">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </span>
          )}
        </button>

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
                'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 min-w-[220px]',
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
                  Görseli Kaldır
                </MenuItem>
              )}
            </div>
          </>
        )}
      </div>

      {hint && !error && (
        <span className="text-body-sm text-on-surface/50">{hint}</span>
      )}

      {error && (
        <span role="alert" className="text-body-sm text-primary">
          {error}
        </span>
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
