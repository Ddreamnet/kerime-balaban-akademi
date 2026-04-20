import { useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { X, Phone, MessageCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { academyInfo, contactLinks } from '@/data/academyInfo'

interface NavItem {
  label: string
  href: string
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  navItems: NavItem[]
}

/**
 * Full-screen mobile navigation drawer.
 * Slides in from the right, closes on nav, Escape, or backdrop.
 * Large touch targets throughout.
 */
export function MobileDrawer({ isOpen, onClose, navItems }: MobileDrawerProps) {
  const navigate = useNavigate()

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigasyon menüsü">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface-card shadow-ambient-lg animate-slide-in-right flex flex-col pt-safe pb-safe pr-safe">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-low">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
            aria-label="Anasayfa"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="font-display font-black text-white text-xs tracking-tight">KBA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-on-surface text-sm">Kerime Balaban</span>
              <span className="font-display font-semibold text-primary text-xs tracking-widest uppercase">Akademi</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="flex items-center justify-center w-10 h-10 rounded-md text-on-surface/70 hover:text-on-surface hover:bg-surface-low transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobil navigasyon">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3.5 rounded-lg',
                      'text-title-md font-semibold font-display',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-primary-container text-primary'
                        : 'text-on-surface hover:bg-surface-low'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Divider via spacing — no 1px lines */}
          <div className="h-6" />

          {/* Auth links */}
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink
                to="/giris"
                onClick={onClose}
                className="flex items-center px-4 py-3.5 rounded-lg text-title-md font-semibold font-display text-on-surface/60 hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                Giriş Yap
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/kayit"
                onClick={onClose}
                className="flex items-center px-4 py-3.5 rounded-lg text-title-md font-semibold font-display text-on-surface/60 hover:bg-surface-low hover:text-on-surface transition-colors"
              >
                Kayıt Ol
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Bottom CTA strip */}
        <div className="px-4 pb-8 pt-4 border-t border-surface-low flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => { onClose(); navigate('/kayit') }}
          >
            Kayıt Ol
          </Button>

          <div className="flex gap-2">
            <a
              href={contactLinks.phone}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg',
                'bg-surface-low text-on-surface/70 hover:text-on-surface',
                'text-body-sm font-medium transition-colors'
              )}
            >
              <Phone className="w-4 h-4" />
              <span>Ara</span>
            </a>
            <a
              href={contactLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg',
                'bg-green-50 text-green-700 hover:bg-green-100',
                'text-body-sm font-medium transition-colors'
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          <p className="text-body-sm text-on-surface/40 text-center">
            {academyInfo.district}
          </p>
        </div>
      </div>
    </div>
  )
}
