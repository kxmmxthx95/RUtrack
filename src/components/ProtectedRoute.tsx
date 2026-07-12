import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 px-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

/** Requires a signed-in user; redirects to /login otherwise. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/** Requires a completed student profile; redirects to /setup otherwise. */
export function RequireProfile() {
  const { profile, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (!profile) return <Navigate to="/setup" replace />
  return <Outlet />
}

/** Restricts the admin area to users whose profile has is_admin: true. */
export function RequireAdmin() {
  const { profile, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (!profile?.is_admin) return <Navigate to="/" replace />
  return <Outlet />
}

/** For /login and /register: bounce signed-in users to the app. */
export function RedirectIfAuthed() {
  const { user, profile, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (user) return <Navigate to={profile?.is_admin ? "/admin" : "/"} replace />
  return <Outlet />
}

/** For student routes: redirects admin users to /admin. */
export function RequireStudent() {
  const { profile, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (profile?.is_admin) return <Navigate to="/admin" replace />
  return <Outlet />
}
