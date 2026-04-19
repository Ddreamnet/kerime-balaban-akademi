import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Menu, LogIn, UserPlus } from 'lucide-react'
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

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrolled = useScrolled(50)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Only the homepage has a dark hero — all other pages have light backgrounds
  const isHomePage = pathname === '/'
  // Use "solid" (dark text) mode on non-home pages or when scrolled
  const solid = !isHomePage || scrolled

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40',
          'transition-all duration-500 ease-out',
          scrolled
            ? 'glass shadow-ambient-md py-2.5'
            : solid
              ? 'bg-surface-card shadow-ambient py-3'
              : 'bg-transparent py-4',
        )}
      >
        <Container>
          <div className="flex items-center justify-between gap-4">
            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              aria-label="Kerime Balaban Akademi — Anasayfa"
            >
              <div className="relative h-14 sm:h-16 aspect-[3747/1492]">
                <img
                  src="/images/logo-beyaz.png"
                  alt="Kerime Balaban Akademi"
                  className={cn(
                    'absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-out',
                    solid ? 'opacity-0' : 'opacity-100',
                  )}
                  draggable={false}
                />
                <img
                  src="/images/logo-renkli.png"
                  alt="Kerime Balaban Akademi"
                  aria-hidden={!solid}
                  className={cn(
                    'absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-out',
                    solid ? 'opacity-100' : 'opacity-0',
                  )}
                  draggable={false}
                />
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav
              className="hidden lg:flex items-center gap-0.5"
              aria-label="Ana navigasyon"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative px-3.5 py-2 text-body-md font-medium rounded-lg',
                      'transition-all duration-200',
                      'focus-visible:outline-2 focus-visible:outline-primary',
                      solid
                        ? isActive
                          ? 'text-primary bg-primary-container/50'
                          : 'text-on-surface/70 hover:text-on-surface hover:bg-surface-low'
                        : isActive
                          ? 'text-white bg-white/10'
                          : 'text-white/70 hover:text-white hover:bg-white/8',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className={cn(
                          'absolute bottom-0 left-3 right-3 h-0.5 rounded-full',
                          solid ? 'bg-primary' : 'bg-white',
                        )} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* ── Desktop Auth ── */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/giris')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-body-sm font-semibold',
                  'transition-all duration-200',
                  solid
                    ? 'text-on-surface/70 hover:text-on-surface hover:bg-surface-low'
                    : 'text-white/70 hover:text-white hover:bg-white/8',
                )}
              >
                <LogIn className="w-4 h-4" />
                Giris Yap
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/kayit')}
                className={cn(
                  'transition-all duration-200',
                  !solid && 'shadow-primary-glow/30',
                )}
              >
                <UserPlus className="w-4 h-4" />
                Kayit Ol
              </Button>
            </div>

            {/* ── Mobile ── */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                onClick={() => navigate('/giris')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-semibold',
                  'transition-colors duration-200',
                  solid
                    ? 'text-on-surface/70 hover:text-on-surface'
                    : 'text-white/70 hover:text-white',
                )}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">Giris</span>
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Menuyu ac"
                aria-expanded={drawerOpen}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  'transition-all duration-200',
                  solid
                    ? 'text-on-surface/70 hover:text-on-surface hover:bg-surface-low'
                    : 'text-white/70 hover:text-white hover:bg-white/10',
                )}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Spacer */}
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
