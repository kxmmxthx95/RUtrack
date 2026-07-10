import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  IoBookOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
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
  const [activeIndex, setActiveIndex] = useState(2)

  const handleLogout = async () => {
    await logOut()
    navigate("/login", { replace: true })
  }

  const displayedItems = MENU_ITEMS

  // Fan / Coverflow transform generator
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex
    const absDiff = Math.abs(diff)
    
    // Arch height adjustment
    const translateY = absDiff * 14
    // Rotation for fan shape
    const rotateZ = diff * 7
    // Horizontal overlapping offset
    const translateX = diff * 50
    // Card scale factor
    const scale = 1 - absDiff * 0.08
    // Transparency factor
    const opacity = 1 - absDiff * 0.18
    const zIndex = 10 - absDiff

    return {
      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateZ}deg) scale(${scale})`,
      opacity: opacity > 0 ? opacity : 0,
      zIndex,
      transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4">
      {/* Title & Subtitle */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          RU Track Workspace
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          พื้นที่จัดการตัวเองสำหรับนักศึกษา บันทึกความคืบหน้า วางแผนตารางเวลา และเตรียมพร้อมสำหรับทุกการสอบ
        </p>
      </div>

      {/* DESKTOP VIEW: 6-Card Expandable Menu Layout */}
      <div className="hidden md:flex flex-col md:flex-row gap-1.5 w-full max-w-5xl h-[420px] transition-all duration-300">
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

      {/* MOBILE VIEW: Beautiful cover-flow fan/arch style with white background */}
      <div className="md:hidden flex flex-col items-center justify-center w-full bg-white dark:bg-slate-900 py-10 px-4 overflow-hidden">
        {/* Card Stage */}
        <div className="relative w-full h-[280px] flex items-center justify-center">
          {displayedItems.map((item, index) => {
            const Icon = item.icon
            const isActive = index === activeIndex
            const cardStyle = getCardStyle(index)

            return (
              <div
                key={index}
                style={cardStyle}
                onClick={() => {
                  if (isActive) {
                    if (item.isLogout) {
                      handleLogout()
                    } else {
                      navigate(item.to)
                    }
                  } else {
                    setActiveIndex(index)
                  }
                }}
                className="absolute w-[140px] h-[220px] rounded-2xl overflow-hidden shadow-md border border-white/20 cursor-pointer origin-bottom"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                
                {/* Dark Overlay */}
                <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? 'bg-black/20' : 'bg-black/45'}`} />

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? 'bg-white text-slate-900 scale-100' : 'bg-white/20 backdrop-blur-sm text-white scale-90'}`}>
                    <Icon className="size-5" />
                  </div>
                </div>

                {/* Label (only shown for active card) */}
                {isActive && (
                  <div className="absolute bottom-3 left-0 right-0 text-center animate-fade-in">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md border border-white/20 text-[9px] font-semibold text-white tracking-wide uppercase">
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Navigation & Pagination */}
        <div className="flex items-center gap-6 mt-6">
          {/* Prev Button */}
          <button
            onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedItems.length - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <IoChevronBackOutline className="size-4" />
          </button>

          {/* Pagination Dots */}
          <div className="flex items-center gap-1.5">
            {displayedItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === activeIndex ? 'w-4 bg-slate-800 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setActiveIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : 0))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <IoChevronForwardOutline className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
