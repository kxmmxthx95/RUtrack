import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  IoArrowBackOutline as ArrowLeft,
  IoGridOutline as LayoutDashboard,
  IoLibraryOutline as Library,
  IoLogOutOutline as LogOut,
  IoSettingsOutline as Settings,
  IoShieldCheckmarkOutline as ShieldCheck,
  IoPeopleOutline as Users,
} from "react-icons/io5"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const ADMIN_NAV = [
  { to: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard, end: true },
  { to: "/admin/master-courses", label: "คลังรายวิชา", icon: Library },
  { to: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
  { to: "/admin/settings", label: "ตั้งค่า", icon: Settings },
]

function pageTitle(pathname: string): string {
  const item = ADMIN_NAV.find((n) =>
    n.end ? pathname === n.to : pathname.startsWith(n.to),
  )
  return item?.label ?? "ผู้ดูแลระบบ"
}

export default function AdminLayout() {
  const { user, logOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logOut()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" />
          </span>
          RU Track ผู้ดูแลระบบ
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* Bottom section: plain text + icons only — no avatar by design */}
        <div className="space-y-2 p-3">
          <Separator />
          <p className="truncate px-3 text-xs text-muted-foreground">
            เข้าสู่ระบบด้วย {user?.email}
          </p>
          <div className="grid gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="size-4" /> กลับสู่แอป
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="size-4" /> ออกจากระบบ
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4">
          <span className="font-semibold md:hidden">RU Track ผู้ดูแลระบบ</span>
          <h1 className="hidden text-lg font-semibold md:block">
            {pageTitle(location.pathname)}
          </h1>
          {/* Mobile nav */}
          <nav className="ml-auto flex items-center gap-1 md:hidden">
            {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md p-2",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )
                }
              >
                <Icon className="size-4" />
                <span className="sr-only">{label}</span>
              </NavLink>
            ))}
            <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="sr-only">ออกจากระบบ</span>
            </Button>
          </nav>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
