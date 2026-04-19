import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut,
  LayoutDashboard,
  UserCheck,
  Users,
  UserCog,
  GraduationCap,
  Megaphone,
  CalendarDays,
  ShoppingBag,
  CreditCard,
  ClipboardCheck,
  Award,
  Bell,
  FileCog,
  User,
  Notebook,
  Baby,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/types/auth.types'

interface DashboardNavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DashboardLayoutProps {
  navItems: DashboardNavItem[]
  title: string
}

// ─── Swipe-back hook ────────────────────────────────────────────────────────

function useSwipeBack(onBack: () => void, threshold = 80) {
  const startX = useRef(0)
  const startY = useRef(0)
  const swiping = useRef(false)

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      // Only trigger from the left 30px edge
      if (touch.clientX > 30) return
      startX.current = touch.clientX
      startY.current = touch.clientY
      swiping.current = true
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!swiping.current) return
      swiping.current = false
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startX.current
      const dy = Math.abs(touch.clientY - startY.current)
      // Horizontal swipe, not diagonal
      if (dx > threshold && dy < dx * 0.5) {
        onBack()
      }
    }

    const onTouchCancel = () => { swiping.current = false }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('touchcancel', onTouchCancel, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [onBack, threshold])
}

// ─── Mobile nav title resolver ──────────────────────────────────────────────

function usePageTitle(navItems: DashboardNavItem[]): string {
  const { pathname } = useLocation()
  const match = navItems.find((item) => pathname.endsWith(item.href.split('/').pop() ?? ''))
  return match?.label ?? 'Panel'
}

// ─── Main layout ────────────────────────────────────────────────────────────

export function DashboardLayout({ navItems, title }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pageTitle = usePageTitle(navItems)
  const panelHome = navItems[0]?.href ?? '/'

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false) }, [location.pathname])

  // Is this the root "panel" page? If so, no back button needed
  const isRootPanel = location.pathname.endsWith('/panel')

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  // Swipe-back gesture (mobile only)
  useSwipeBack(handleBack)

  const handleSignOut = () => {
    signOut()
    navigate('/giris')
  }

  return (
    <div className="min-h-dvh flex bg-surface">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface-card shadow-ambient">
        <div className="px-5 py-4 border-b border-surface-low">
          <NavLink
            to={panelHome}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            aria-label={`${title} — Genel Bakış`}
          >
            <img
              src="/images/logo-renkli.png"
              alt="Kerime Balaban Akademi"
              className="h-12 w-auto object-contain"
              draggable={false}
            />
          </NavLink>
        </div>

        <div className="px-5 py-3">
          <p className="text-label-sm uppercase tracking-widest text-on-surface/40">{title}</p>
        </div>

        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href.split('/').length === 3}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'text-body-md font-medium transition-colors',
                      isActive
                        ? 'bg-primary-container text-primary'
                        : 'text-on-surface/60 hover:bg-surface-low hover:text-on-surface',
                    )
                  }
                >
                  {item.icon && <item.icon className="w-4 h-4 shrink-0" />}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-surface-low">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span className="text-label-sm font-bold text-primary">
                {user?.full_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-on-surface truncate">
                {user?.full_name ?? 'Kullanıcı'}
              </p>
              <p className="text-label-sm text-on-surface/40 truncate">
                {user ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-body-md text-on-surface/60 hover:bg-surface-low hover:text-on-surface transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden bg-surface-card shadow-ambient">
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Back or menu */}
          {!isRootPanel ? (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-low transition-colors"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-low transition-colors"
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Title */}
          <h2 className="flex-1 font-display font-bold text-title-md text-on-surface truncate">
            {pageTitle}
          </h2>

          {/* Hamburger (when back button is showing) */}
          {!isRootPanel && (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-low transition-colors"
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile nav drawer ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-card shadow-ambient-lg animate-slide-in-left flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-surface-low">
              <NavLink
                to={panelHome}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                aria-label={`${title} — Genel Bakış`}
              >
                <img
                  src="/images/logo-renkli.png"
                  alt="Kerime Balaban Akademi"
                  className="h-12 w-auto object-contain"
                  draggable={false}
                />
              </NavLink>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-on-surface/60 hover:text-on-surface hover:bg-surface-low transition-colors shrink-0"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <p className="px-3 mb-2 text-label-sm uppercase tracking-widest text-on-surface/40">
                {title}
              </p>
              <ul className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href.split('/').length === 3}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg',
                          'text-body-md font-medium transition-colors min-h-touch',
                          isActive
                            ? 'bg-primary-container text-primary'
                            : 'text-on-surface/60 hover:bg-surface-low hover:text-on-surface',
                        )
                      }
                    >
                      {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User + sign out */}
            <div className="px-3 py-4 border-t border-surface-low">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="text-label-sm font-bold text-primary">
                    {user?.full_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-semibold text-on-surface truncate">
                    {user?.full_name ?? 'Kullanıcı'}
                  </p>
                  <p className="text-label-sm text-on-surface/40 truncate">
                    {user ? ROLE_LABELS[user.role] : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-body-md text-on-surface/60 hover:bg-surface-low hover:text-on-surface transition-colors min-h-touch"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile spacer for fixed top bar */}
        <div className="h-[60px] lg:hidden shrink-0" />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ─── Role-specific dashboard wrappers ───────────────────────────────────────

export function AdminLayout() {
  return (
    <DashboardLayout
      title="Yönetici Paneli"
      navItems={[
        { label: 'Genel Bakış', href: '/admin/panel', icon: LayoutDashboard },
        { label: 'Onay Bekleyenler', href: '/admin/onaylar', icon: UserCheck },
        { label: 'Antrenörler', href: '/admin/antrenorler', icon: UserCog },
        { label: 'Veliler', href: '/admin/veliler', icon: Users },
        { label: 'Öğrenciler', href: '/admin/ogrenciler', icon: GraduationCap },
        { label: 'Duyurular', href: '/admin/duyurular', icon: Megaphone },
        { label: 'Dersler', href: '/admin/dersler', icon: CalendarDays },
        { label: 'Ürünler', href: '/admin/urunler', icon: ShoppingBag },
        { label: 'Ödemeler', href: '/admin/odemeler', icon: CreditCard },
        { label: 'Devamsızlık', href: '/admin/devamsizlik', icon: ClipboardCheck },
        { label: 'Sınavlar', href: '/admin/sinavlar', icon: Award },
        { label: 'Bildirimler', href: '/admin/bildirimler', icon: Bell },
        { label: 'Site İçeriği', href: '/admin/icerik', icon: FileCog },
      ]}
    />
  )
}

export function CoachLayout() {
  return (
    <DashboardLayout
      title="Antrenör Paneli"
      navItems={[
        { label: 'Genel Bakış', href: '/antrenor/panel', icon: LayoutDashboard },
        { label: 'Öğrenciler', href: '/antrenor/ogrenciler', icon: GraduationCap },
        { label: 'Devamsızlık', href: '/antrenor/devamsizlik', icon: ClipboardCheck },
        { label: 'Sınavlar', href: '/antrenor/sinavlar', icon: Award },
        { label: 'Bildirimler', href: '/antrenor/bildirimler', icon: Bell },
        { label: 'Gruplar', href: '/antrenor/gruplar', icon: Users },
        { label: 'Notlar', href: '/antrenor/notlar', icon: Notebook },
      ]}
    />
  )
}

export function ParentLayout() {
  return (
    <DashboardLayout
      title="Veli Paneli"
      navItems={[
        { label: 'Genel Bakış', href: '/veli/panel', icon: LayoutDashboard },
        { label: 'Çocuğum', href: '/veli/cocugum', icon: Baby },
        { label: 'Devamsızlık', href: '/veli/devamsizlik', icon: ClipboardCheck },
        { label: 'Ödemeler', href: '/veli/odemeler', icon: CreditCard },
        { label: 'Sınavlar', href: '/veli/sinavlar', icon: Award },
        { label: 'Bildirimler', href: '/veli/bildirimler', icon: Bell },
        { label: 'Profil', href: '/veli/profil', icon: User },
      ]}
    />
  )
}

export type { DashboardNavItem, DashboardLayoutProps }
