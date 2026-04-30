import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout, CoachLayout, ParentLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

// Initial bundle'da tutulan critical page'ler:
// - HomePage: kullanıcının ilk gördüğü sayfa
// - NotFoundPage: deeplink'lerde anlık göstermek için (küçük)
import { HomePage } from '@/features/home/HomePage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'

/**
 * React Router 6.4+ `lazy` field için helper. Vite import() chunk'ı bölerek
 * route'a girilene kadar JS'i indirmez. Cold-start bundle ~580KB → tahmini
 * ~200KB initial + 50-150KB her dashboard chunk.
 *
 * exportName named export kullandığımız için gerekli (default export yok).
 */
function lazy<T extends string>(
  loader: () => Promise<Record<T, ComponentType<unknown>>>,
  exportName: T,
) {
  return async () => {
    const mod = await loader()
    return { Component: mod[exportName] }
  }
}

export const router = createBrowserRouter([
  {
    element: <AppShell><PublicLayout /></AppShell>,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'dersler',
        lazy: lazy(() => import('@/features/classes/ClassesPage'), 'ClassesPage'),
      },
      {
        path: 'urunler',
        lazy: lazy(() => import('@/features/products/ProductsPage'), 'ProductsPage'),
      },
      {
        path: 'iletisim',
        lazy: lazy(() => import('@/features/contact/ContactPage'), 'ContactPage'),
      },
      {
        path: 'duyurular',
        lazy: lazy(
          () => import('@/features/announcements/AnnouncementsPage'),
          'AnnouncementsPage',
        ),
      },
      {
        path: 'duyurular/:id',
        lazy: lazy(
          () => import('@/features/announcements/AnnouncementDetailPage'),
          'AnnouncementDetailPage',
        ),
      },
      {
        path: 'hakkimizda',
        lazy: lazy(() => import('@/features/about/AboutPage'), 'AboutPage'),
      },
      {
        path: 'gizlilik',
        lazy: lazy(() => import('@/features/privacy/PrivacyPage'), 'PrivacyPage'),
      },
      {
        path: 'giris',
        lazy: lazy(() => import('@/features/auth/LoginPage'), 'LoginPage'),
      },
      {
        path: 'kayit',
        lazy: lazy(() => import('@/features/auth/RegisterPage'), 'RegisterPage'),
      },
      {
        path: 'sifremi-unuttum',
        lazy: lazy(() => import('@/features/auth/ForgotPasswordPage'), 'ForgotPasswordPage'),
      },
      {
        path: 'sifre-sifirla',
        lazy: lazy(() => import('@/features/auth/ResetPasswordPage'), 'ResetPasswordPage'),
      },
    ],
  },

  // ─── Admin dashboard ────────────────────────────────────────────────────────
  {
    path: 'admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AppShell><AdminLayout /></AppShell>,
        children: [
          { index: true, element: <Navigate to="panel" replace /> },
          { path: 'panel', lazy: lazy(() => import('@/features/admin/AdminDashboard'), 'AdminDashboard') },
          { path: 'onaylar', lazy: lazy(() => import('@/features/admin/AdminApprovalsPage'), 'AdminApprovalsPage') },
          { path: 'antrenorler', lazy: lazy(() => import('@/features/admin/AdminCoachesPage'), 'AdminCoachesPage') },
          { path: 'uyeler', lazy: lazy(() => import('@/features/admin/AdminStudentsPage'), 'AdminStudentsPage') },
          { path: 'ogrenci/:id', lazy: lazy(() => import('@/features/admin/AdminStudentDetailPage'), 'AdminStudentDetailPage') },
          { path: 'atamalar', lazy: lazy(() => import('@/features/admin/AdminAssignmentsPage'), 'AdminAssignmentsPage') },
          // Eski yollar — birleştirilmiş üyeler sayfasına yönlendir.
          { path: 'veliler', element: <Navigate to="/admin/uyeler" replace /> },
          { path: 'ogrenciler', element: <Navigate to="/admin/uyeler" replace /> },
          { path: 'duyurular', lazy: lazy(() => import('@/features/admin/AdminAnnouncementsPage'), 'AdminAnnouncementsPage') },
          { path: 'dersler', lazy: lazy(() => import('@/features/admin/AdminClassesPage'), 'AdminClassesPage') },
          { path: 'urunler', lazy: lazy(() => import('@/features/admin/AdminProductsPage'), 'AdminProductsPage') },
          { path: 'odemeler', lazy: lazy(() => import('@/features/admin/AdminPaymentsPage'), 'AdminPaymentsPage') },
          { path: 'sinavlar', lazy: lazy(() => import('@/features/admin/AdminExamsPage'), 'AdminExamsPage') },
          { path: 'bildirimler', lazy: lazy(() => import('@/features/admin/AdminNotificationsPage'), 'AdminNotificationsPage') },
          { path: 'icerik', lazy: lazy(() => import('@/features/admin/AdminSiteContentPage'), 'AdminSiteContentPage') },
          { path: 'devamsizlik', lazy: lazy(() => import('@/features/admin/AdminAttendancePage'), 'AdminAttendancePage') },
          { path: 'branslar', lazy: lazy(() => import('@/features/admin/AdminBranchesPage'), 'AdminBranchesPage') },
        ],
      },
    ],
  },

  // ─── Coach dashboard ────────────────────────────────────────────────────────
  {
    path: 'antrenor',
    element: <ProtectedRoute allowedRoles={['coach']} />,
    children: [
      {
        element: <AppShell><CoachLayout /></AppShell>,
        children: [
          { index: true, element: <Navigate to="panel" replace /> },
          { path: 'panel', lazy: lazy(() => import('@/features/coach/CoachDashboard'), 'CoachDashboard') },
          { path: 'ogrenciler', lazy: lazy(() => import('@/features/coach/CoachStudentsPage'), 'CoachStudentsPage') },
          { path: 'ogrenci/:id', lazy: lazy(() => import('@/features/coach/CoachStudentDetailPage'), 'CoachStudentDetailPage') },
          { path: 'devamsizlik', lazy: lazy(() => import('@/features/coach/CoachAttendancePage'), 'CoachAttendancePage') },
          { path: 'sinavlar', lazy: lazy(() => import('@/features/coach/CoachExamsPage'), 'CoachExamsPage') },
          { path: 'bildirimler', lazy: lazy(() => import('@/features/coach/CoachNotificationsPage'), 'CoachNotificationsPage') },
          { path: 'gruplar', lazy: lazy(() => import('@/features/coach/CoachGroupsPage'), 'CoachGroupsPage') },
          { path: 'notlar', lazy: lazy(() => import('@/features/coach/CoachNotesPage'), 'CoachNotesPage') },
          { path: 'profil', lazy: lazy(() => import('@/features/coach/CoachProfilePage'), 'CoachProfilePage') },
          { path: 'performans', element: <Navigate to="/antrenor/notlar" replace /> },
        ],
      },
    ],
  },

  // ─── Parent dashboard ────────────────────────────────────────────────────────
  {
    path: 'veli',
    element: <ProtectedRoute allowedRoles={['parent']} />,
    children: [
      {
        element: <AppShell><ParentLayout /></AppShell>,
        children: [
          { index: true, element: <Navigate to="panel" replace /> },
          { path: 'panel', lazy: lazy(() => import('@/features/parent/ParentDashboard'), 'ParentDashboard') },
          { path: 'cocugum', lazy: lazy(() => import('@/features/parent/ChildProfilePage'), 'ChildProfilePage') },
          { path: 'gelisim', lazy: lazy(() => import('@/features/parent/ParentDevelopmentPage'), 'ParentDevelopmentPage') },
          { path: 'profil', lazy: lazy(() => import('@/features/parent/ParentProfilePage'), 'ParentProfilePage') },
          { path: 'devamsizlik', lazy: lazy(() => import('@/features/parent/ParentAttendancePage'), 'ParentAttendancePage') },
          { path: 'odemeler', lazy: lazy(() => import('@/features/parent/ParentPaymentsPage'), 'ParentPaymentsPage') },
          { path: 'sinavlar', lazy: lazy(() => import('@/features/parent/ParentExamsPage'), 'ParentExamsPage') },
          { path: 'bildirimler', lazy: lazy(() => import('@/features/parent/ParentNotificationsPage'), 'ParentNotificationsPage') },
        ],
      },
    ],
  },

  // ─── 404 ────────────────────────────────────────────────────────────────────
  { path: '*', element: <AppShell><NotFoundPage /></AppShell> },
])
