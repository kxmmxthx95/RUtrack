import { Link, useNavigate } from "react-router-dom"
import {
  IoBookOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
} from "react-icons/io5"
import { useAuth } from "@/contexts/AuthContext"

const MENU_ITEMS = [
  {
    to: "/courses",
    icon: IoBookOutline,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80",
    label: "รายวิชาเรียน",
  },
  {
    to: "/calendar",
    icon: IoCalendarOutline,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&auto=format&fit=crop&q=80",
    label: "ปฏิทินการศึกษา",
  },
  {
    to: "/grades",
    icon: IoTrendingUpOutline,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
    label: "การทำนายเกรด",
  },
  {
    to: "/setup",
    icon: IoPersonOutline,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    label: "ข้อมูลส่วนตัว",
  },
  {
    to: "/admin",
    icon: IoShieldCheckmarkOutline,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80",
    label: "แผงผู้ดูแลระบบ",
    adminOnly: true,
  },
  {
    to: "/login",
    icon: IoLogOutOutline,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
    label: "ออกจากระบบ",
    isLogout: true,
  },
]

export default function DashboardPage() {
  const { logOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logOut()
    navigate("/login", { replace: true })
  }

  // Filter items: If not admin, we can still show all 6 cards to maintain the exact 6-card design layout of the mockup
  const displayedItems = MENU_ITEMS

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4">
      {/* Title & Subtitle */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Our Latest Creations
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          A visual collection of our most recent works – each piece crafted with intention, emotion, and style.
        </p>
      </div>

      {/* 6-Card Expandable Menu Layout */}
      <div className="flex flex-col md:flex-row gap-1.5 w-full max-w-5xl h-[480px] md:h-[420px] transition-all duration-300">
        {displayedItems.map((item, index) => {
          const Icon = item.icon
          const cardContent = (
            <>
              {/* Card Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* Clean Dark Overlay */}
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors duration-300" />

              {/* Centered Icon - replaces text name on the card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 group-hover:border-white">
                  <Icon className="size-6" />
                </div>
              </div>

              {/* Subtle Tooltip Label shown on hover at the bottom */}
              <div className="absolute bottom-5 left-0 right-0 text-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white tracking-wide uppercase">
                  {item.label}
                </span>
              </div>
            </>
          )

          const commonClassName = "relative flex-1 md:hover:flex-[2] group rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800/60 transition-all duration-500 ease-out cursor-pointer h-full"

          if (item.isLogout) {
            return (
              <div
                key={index}
                onClick={handleLogout}
                className={commonClassName}
              >
                {cardContent}
              </div>
            )
          }

          return (
            <Link
              key={index}
              to={item.to}
              className={commonClassName}
            >
              {cardContent}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
