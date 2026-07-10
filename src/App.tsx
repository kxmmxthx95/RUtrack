import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import {
  RedirectIfAuthed,
  RequireAdmin,
  RequireAuth,
  RequireNoProfile,
  RequireProfile,
} from "@/components/ProtectedRoute"
import AppLayout from "@/layouts/AppLayout"
import AdminLayout from "@/layouts/AdminLayout"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import MasterCoursesPage from "@/pages/admin/MasterCoursesPage"
import AdminUsersPage from "@/pages/admin/AdminUsersPage"
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ProfileSetupPage from "@/pages/ProfileSetupPage"
import DashboardPage from "@/pages/DashboardPage"
import CoursesPage from "@/pages/CoursesPage"
import CourseDetailPage from "@/pages/CourseDetailPage"
import CalendarPage from "@/pages/CalendarPage"
import GradesPage from "@/pages/GradesPage"
import ThemePreviewPage from "@/pages/ThemePreviewPage"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RedirectIfAuthed />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireNoProfile />}>
              <Route path="/setup" element={<ProfileSetupPage />} />
            </Route>
            <Route element={<RequireProfile />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route
                  path="/courses/:courseId"
                  element={<CourseDetailPage />}
                />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/grades" element={<GradesPage />} />
              </Route>
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route
                    path="master-courses"
                    element={<MasterCoursesPage />}
                  />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="/theme" element={<ThemePreviewPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  )
}

export default App
