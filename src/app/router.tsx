import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout, CoachLayout, ParentLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

// ─── Public pages ─────────────────────────────────────────────────────────────
import { HomePage } from '@/features/home/HomePage'
import { ClassesPage } from '@/features/classes/ClassesPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { ContactPage } from '@/features/contact/ContactPage'
import { AnnouncementsPage } from '@/features/announcements/AnnouncementsPage'
import { AnnouncementDetailPage } from '@/features/announcements/AnnouncementDetailPage'
import { AboutPage } from '@/features/about/AboutPage'
import { PrivacyPage } from '@/features/privacy/PrivacyPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'

// ─── Dashboard pages ──────────────────────────────────────────────────────────
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { AdminApprovalsPage } from '@/features/admin/AdminApprovalsPage'
import { AdminCoachesPage } from '@/features/admin/AdminCoachesPage'
import { AdminStudentsPage } from '@/features/admin/AdminStudentsPage'
import { AdminAnnouncementsPage } from '@/features/admin/AdminAnnouncementsPage'
import { AdminClassesPage } from '@/features/admin/AdminClassesPage'
import { AdminProductsPage } from '@/features/admin/AdminProductsPage'
import { AdminStudentDetailPage } from '@/features/admin/AdminStudentDetailPage'
import { AdminAssignmentsPage } from '@/features/admin/AdminAssignmentsPage'
import { AdminPaymentsPage } from '@/features/admin/AdminPaymentsPage'
import { AdminExamsPage } from '@/features/admin/AdminExamsPage'
import { AdminNotificationsPage } from '@/features/admin/AdminNotificationsPage'
import { AdminSiteContentPage } from '@/features/admin/AdminSiteContentPage'
import { AdminAttendancePage } from '@/features/admin/AdminAttendancePage'
import { CoachDashboard } from '@/features/coach/CoachDashboard'
import { CoachStudentsPage } from '@/features/coach/CoachStudentsPage'
import { CoachStudentDetailPage } from '@/features/coach/CoachStudentDetailPage'
import { CoachAttendancePage } from '@/features/coach/CoachAttendancePage'
import { CoachExamsPage } from '@/features/coach/CoachExamsPage'
import { CoachNotificationsPage } from '@/features/coach/CoachNotificationsPage'
import { CoachGroupsPage } from '@/features/coach/CoachGroupsPage'
import { CoachNotesPage } from '@/features/coach/CoachNotesPage'
import { CoachProfilePage } from '@/features/coach/CoachProfilePage'
import { ParentDashboard } from '@/features/parent/ParentDashboard'
import { ChildProfilePage } from '@/features/parent/ChildProfilePage'
import { ParentProfilePage } from '@/features/parent/ParentProfilePage'
import { ParentAttendancePage } from '@/features/parent/ParentAttendancePage'
import { ParentPaymentsPage } from '@/features/parent/ParentPaymentsPage'
import { ParentExamsPage } from '@/features/parent/ParentExamsPage'
import { ParentNotificationsPage } from '@/features/parent/ParentNotificationsPage'
import { ParentDevelopmentPage } from '@/features/parent/ParentDevelopmentPage'

export const router = createBrowserRouter([
  {
    element: <AppShell><PublicLayout /></AppShell>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dersler', element: <ClassesPage /> },
      { path: 'urunler', element: <ProductsPage /> },
      { path: 'iletisim', element: <ContactPage /> },
      { path: 'duyurular', element: <AnnouncementsPage /> },
      { path: 'duyurular/:id', element: <AnnouncementDetailPage /> },
      { path: 'hakkimizda', element: <AboutPage /> },
      { path: 'gizlilik', element: <PrivacyPage /> },
      { path: 'giris', element: <LoginPage /> },
      { path: 'kayit', element: <RegisterPage /> },
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
          { path: 'panel', element: <AdminDashboard /> },
          { path: 'onaylar', element: <AdminApprovalsPage /> },
          { path: 'antrenorler', element: <AdminCoachesPage /> },
          { path: 'uyeler', element: <AdminStudentsPage /> },
          { path: 'ogrenci/:id', element: <AdminStudentDetailPage /> },
          { path: 'atamalar', element: <AdminAssignmentsPage /> },
          // Eski yollar — birleştirilmiş üyeler sayfasına yönlendir.
          { path: 'veliler', element: <Navigate to="/admin/uyeler" replace /> },
          { path: 'ogrenciler', element: <Navigate to="/admin/uyeler" replace /> },
          { path: 'duyurular', element: <AdminAnnouncementsPage /> },
          { path: 'dersler', element: <AdminClassesPage /> },
          { path: 'urunler', element: <AdminProductsPage /> },
          { path: 'odemeler', element: <AdminPaymentsPage /> },
          { path: 'sinavlar', element: <AdminExamsPage /> },
          { path: 'bildirimler', element: <AdminNotificationsPage /> },
          { path: 'icerik', element: <AdminSiteContentPage /> },
          { path: 'devamsizlik', element: <AdminAttendancePage /> },
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
          { path: 'panel', element: <CoachDashboard /> },
          { path: 'ogrenciler', element: <CoachStudentsPage /> },
          { path: 'ogrenci/:id', element: <CoachStudentDetailPage /> },
          { path: 'devamsizlik', element: <CoachAttendancePage /> },
          { path: 'sinavlar', element: <CoachExamsPage /> },
          { path: 'bildirimler', element: <CoachNotificationsPage /> },
          { path: 'gruplar', element: <CoachGroupsPage /> },
          { path: 'notlar', element: <CoachNotesPage /> },
          { path: 'profil', element: <CoachProfilePage /> },
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
          { path: 'panel', element: <ParentDashboard /> },
          { path: 'cocugum', element: <ChildProfilePage /> },
          { path: 'gelisim', element: <ParentDevelopmentPage /> },
          { path: 'profil', element: <ParentProfilePage /> },
          { path: 'devamsizlik', element: <ParentAttendancePage /> },
          { path: 'odemeler', element: <ParentPaymentsPage /> },
          { path: 'sinavlar', element: <ParentExamsPage /> },
          { path: 'bildirimler', element: <ParentNotificationsPage /> },
        ],
      },
    ],
  },

  // ─── 404 ────────────────────────────────────────────────────────────────────
  { path: '*', element: <AppShell><NotFoundPage /></AppShell> },
])
