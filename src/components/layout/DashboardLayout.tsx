import { Outlet, NavLink, useNavigate } from 'react-router-dom'
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

export function DashboardLayout({ navItems, title }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/giris')
  }

  return (
    <div className="min-h-dvh flex bg-surface">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface-card shadow-ambient">
        <div className="px-5 py-5 border-b border-surface-low">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-primary flex items-center justify-center">
              <span className="font-display font-black text-white text-xs">KBA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-on-surface text-xs">Kerime Balaban</span>
              <span className="font-display text-primary text-xs uppercase tracking-widest">Akademi</span>
            </div>
          </NavLink>
        </div>

        <div className="px-5 py-3">
          <p className="text-label-sm uppercase tracking-widest text-on-surface/40">
            {title}
          </p>
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
                        : 'text-on-surface/60 hover:bg-surface-low hover:text-on-surface'
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
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
