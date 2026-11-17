import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { Skeleton } from "@/components/ui/skeleton"

const LandingPage = lazy(() => import("@/pages/landing"))
const LoginPage = lazy(() => import("@/pages/login"))
const RegisterPage = lazy(() => import("@/pages/register"))
const DashboardPage = lazy(() => import("@/pages/dashboard"))
const SchedulePage = lazy(() => import("@/pages/schedule"))
const GradesPage = lazy(() => import("@/pages/grades"))
const AttendancePage = lazy(() => import("@/pages/attendance"))
const AnnouncementsPage = lazy(() => import("@/pages/announcements"))
const ProfilePage = lazy(() => import("@/pages/profile"))
const NotFoundPage = lazy(() => import("@/pages/not-found"))

function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
