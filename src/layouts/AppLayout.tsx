import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/", label: "แดชบอร์ด", icon: LayoutDashboard, end: true },
  { to: "/courses", label: "รายวิชา", icon: BookOpen },
  { to: "/calendar", label: "ปฏิทิน", icon: CalendarDays },
  { to: "/grades", label: "เกรด", icon: TrendingUp },
]

export default function AppLayout() {
  const { user, profile, logOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logOut()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </span>
            RU Track
          </NavLink>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
          {/* Plain text + icon only — no avatar components by design */}
          <div className="ml-auto flex items-center gap-3">
            {profile?.is_admin && (
              <Button asChild variant="outline" size="sm">
                <NavLink to="/admin">
                  <ShieldCheck className="size-4" />
                  <span className="hidden sm:inline">ผู้ดูแลระบบ</span>
                </NavLink>
              </Button>
            )}
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
