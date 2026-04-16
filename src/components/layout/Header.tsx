import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Container } from './Container'
import { MobileDrawer } from './MobileDrawer'
import { useScrolled } from '@/hooks/useScrolled'

const navItems = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Dersler', href: '/dersler' },
  { label: 'Ürünler', href: '/urunler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Duyurular', href: '/duyurular' },
]

/**
 * Responsive public header.
 *
 * - Desktop: logo left, nav center, CTA right
 * - Mobile: logo left, hamburger right → MobileDrawer
 * - Scrolled: glassmorphism backdrop
 * - App-shell ready: fixed positioning with safe-area awareness
 */
export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrolled = useScrolled(40)
  const navigate = useNavigate()

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40',
          'transition-all duration-300',
          scrolled
            ? 'glass shadow-ambient border-b border-surface-low/50 py-3'
            : 'bg-transparent py-4'
        )}
      >
        <Container>
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              aria-label="Kerime Balaban Akademi — Anasayfa"
            >
              {/* Logo mark */}
              <div className="w-9 h-9 rounded-md bg-gradient-primary flex items-center justify-center shadow-primary-glow/20">
                <span className="font-display font-black text-white text-sm tracking-tight leading-none">
                  KBA
                </span>
              </div>
              {/* Logo text */}
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-bold text-on-surface text-sm tracking-tight">
                  Kerime Balaban
                </span>
                <span className="font-display font-semibold text-primary text-xs tracking-widest uppercase">
                  Akademi
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Ana navigasyon"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative px-3 py-2 text-body-md font-medium rounded-md',
                      'transition-colors duration-150',
                      'focus-visible:outline-2 focus-visible:outline-primary',
                      isActive
                        ? 'text-primary'
                        : 'text-on-surface/70 hover:text-on-surface hover:bg-surface-low/60'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/giris')}
              >
                Giriş Yap
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/iletisim')}
              >
                Ücretsiz Deneme
              </Button>
            </div>

            {/* Mobile: CTA + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/iletisim')}
                className="text-sm px-3 h-9"
              >
                Deneme Dersi
              </Button>
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Menüyü aç"
                aria-expanded={drawerOpen}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-md',
                  'text-on-surface/70 hover:text-on-surface hover:bg-surface-low/60',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-primary'
                )}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16" aria-hidden="true" />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={navItems}
      />
    </>
  )
}
