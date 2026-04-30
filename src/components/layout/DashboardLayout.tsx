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
  Building2,
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
  TrendingUp,
  X,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_LABELS } from '@/types/auth.types'
import { PanelBackdrop } from './PanelBackdrop'

interface DashboardNavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DashboardLayoutProps {
  navItems: DashboardNavItem[]
  title: string
  /** When set, the bottom-left user block links to this profile page. */
  profileHref?: string
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

// ─── User block (clickable when profileHref is set) ─────────────────────────

interface UserBlockProps {
  user: ReturnType<typeof useAuth>['user']
  profileHref?: string
  avatarSize: string
  className?: string
}

function UserBlock({ user, profileHref, avatarSize, className }: UserBlockProps) {
  const content = (
    <>
      <div
        className={cn(
          'rounded-full bg-gradient-primary flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/80 shadow-primary-glow-sm',
          avatarSize,
        )}
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-display font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-on-surface truncate">
          {user?.full_name ?? 'Kullanıcı'}
        </p>
        <p className="text-label-sm text-on-surface/45 truncate">
          {user ? ROLE_LABELS[user.role] : ''}
        </p>
      </div>
    </>
  )

  if (profileHref) {
    return (
      <NavLink
        to={profileHref}
        className={cn(
          'flex items-center gap-3 rounded-xl hover:bg-surface-low transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
        aria-label="Profil"
      >
        {content}
      </NavLink>
    )
  }

  return <div className={cn('flex items-center gap-3', className)}>{content}</div>
}

// ─── Nav link rendered inside both desktop & mobile drawer ──────────────────

interface NavItemLinkProps {
  item: DashboardNavItem
  variant: 'desktop' | 'mobile'
  onNavigate?: () => void
}

function NavItemLink({ item, variant, onNavigate }: NavItemLinkProps) {
  return (
    <NavLink
      to={item.href}
      end={item.href.split('/').length === 3}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl transition-all duration-150',
          variant === 'desktop'
            ? 'px-3 py-2.5 text-body-md font-medium'
            : 'px-3 py-3 text-body-md font-medium min-h-touch',
          isActive
            ? 'bg-primary text-white shadow-primary-glow-sm'
            : 'text-on-surface/65 hover:bg-surface-low hover:text-on-surface',
        )
      }
    >
      {({ isActive }) => (
        <>
          {item.icon && (
            <item.icon
              className={cn(
                'shrink-0 transition-transform',
                variant === 'desktop' ? 'w-4 h-4' : 'w-5 h-5',
                isActive ? 'scale-110' : 'group-hover:scale-105',
              )}
            />
          )}
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

// ─── Main layout ────────────────────────────────────────────────────────────

export function DashboardLayout({ navItems, title, profileHref }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
    <div className="relative min-h-dvh flex bg-surface overflow-hidden isolate">
      {/* Ambient panel backdrop — viewport-fixed, pointer-events-none */}
      <PanelBackdrop />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface-card shadow-ambient pt-safe pb-safe pl-safe relative z-10 overflow-hidden">
        {/* Subtle red glow in corner — same DNA as hero */}
        <div
          className="absolute -top-20 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative px-5 py-4 border-b border-surface-low/80">
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

        <div className="relative px-5 pt-3 pb-1">
          <p className="panel-kicker">{title}</p>
        </div>

        <nav className="relative flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavItemLink item={item} variant="desktop" />
              </li>
            ))}
          </ul>
        </nav>

        {/*
         * "Signature zone" — bottom of the sidebar carries the user's identity
         * + sign-out. A wine wash + a hairline wine beam at the top makes the
         * area feel grounded without dragging attention from active nav.
         */}
        <div className="relative px-3 py-3 border-t border-surface-low/80 flex flex-col gap-1 bg-wine/[0.025]">
          <div className="panel-wine-beam top-0 left-3 right-3" aria-hidden="true" />
          <UserBlock
            user={user}
            profileHref={profileHref}
            avatarSize="w-9 h-9"
            className="px-3 py-2"
          />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-body-md text-on-surface/60 hover:bg-wine/[0.06] hover:text-wine transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden bg-surface-card/95 backdrop-blur-md shadow-ambient-sm pt-safe pl-safe pr-safe">
        {/* Hairline wine beam below the top bar — subtle "this is the panel" mark */}
        <div className="panel-wine-beam bottom-0 left-0 right-0" aria-hidden="true" />
        <div className="flex items-center gap-2 px-3 py-1.5">
          {!isRootPanel ? (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface/60 hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Geri"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface/60 hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Menü"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center flex-1 min-w-0">
            <h2 className="font-display font-bold text-title-md text-primary truncate">
              {title}
            </h2>
          </div>

          {!isRootPanel && (
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface/60 hover:text-primary hover:bg-primary/5 transition-colors"
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
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Panel — `absolute inset-y-0` fills viewport height. The
              decorative glow inside positions itself off this absolute
              context, so no extra `relative` is needed (and adding one
              would override `absolute` and collapse the panel to content
              height — which is what was making the logout slip off-screen). */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-card shadow-ambient-lg animate-slide-in-left flex flex-col pt-safe pb-safe pl-safe overflow-hidden">
            {/* Glow accent — same as desktop sidebar */}
            <div
              className="absolute -top-20 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="relative flex items-center justify-between gap-2 px-4 py-3 border-b border-surface-low/80">
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
                className="flex items-center justify-center w-11 h-11 rounded-xl text-on-surface/60 hover:text-on-surface hover:bg-surface-low transition-colors shrink-0"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="relative flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
              <p className="px-3 mb-2 panel-kicker">{title}</p>
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <NavItemLink
                      item={item}
                      variant="mobile"
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Signature zone — same wine wash as the desktop sidebar */}
            <div className="relative px-3 py-3 border-t border-surface-low/80 flex flex-col gap-1 bg-wine/[0.025]">
              <div className="panel-wine-beam top-0 left-3 right-3" aria-hidden="true" />
              <UserBlock
                user={user}
                profileHref={profileHref}
                avatarSize="w-10 h-10"
                className="px-3 py-2 min-h-touch"
              />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-body-md text-on-surface/60 hover:bg-wine/[0.06] hover:text-wine transition-colors min-h-touch"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Mobile spacer for fixed top bar — includes status-bar safe area */}
        <div className="h-[calc(60px+env(safe-area-inset-top,0px))] lg:hidden shrink-0" />
        <main className="flex-1 p-4 md:p-8 pb-safe overflow-y-auto">
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
        { label: 'Üyeler', href: '/admin/uyeler', icon: Users },
        { label: 'Branşlar', href: '/admin/branslar', icon: Building2 },
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
      profileHref="/antrenor/profil"
      navItems={[
        { label: 'Genel Bakış', href: '/antrenor/panel', icon: LayoutDashboard },
        { label: 'Öğrenciler', href: '/antrenor/ogrenciler', icon: GraduationCap },
        { label: 'Yoklama', href: '/antrenor/devamsizlik', icon: ClipboardCheck },
        { label: 'Sınavlar', href: '/antrenor/sinavlar', icon: Award },
        { label: 'Bildirimler', href: '/antrenor/bildirimler', icon: Bell },
        { label: 'Gruplar', href: '/antrenor/gruplar', icon: Users },
        { label: 'Notlar', href: '/antrenor/notlar', icon: Notebook },
        { label: 'Profil', href: '/antrenor/profil', icon: User },
      ]}
    />
  )
}

export function ParentLayout() {
  return (
    <DashboardLayout
      title="Veli Paneli"
      profileHref="/veli/profil"
      navItems={[
        { label: 'Genel Bakış', href: '/veli/panel', icon: LayoutDashboard },
        { label: 'Çocuğum', href: '/veli/cocugum', icon: Baby },
        { label: 'Gelişim', href: '/veli/gelisim', icon: TrendingUp },
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
