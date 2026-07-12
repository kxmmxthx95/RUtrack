import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  IoBookOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLibraryOutline,
} from "react-icons/io5"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

const MENU_ITEMS = [
  {
    to: "/courses",
    icon: IoBookOutline,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80",
    label: "หลักสูตร",
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
    to: "/profile",
    icon: IoPersonOutline,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    label: "ข้อมูลส่วนตัว",
  },
  {
    to: "/admin",
    icon: IoLibraryOutline,
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
    label: "คลังข้อสอบ",
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
  const [pageLoading, setPageLoading] = useState(true)
  const [animatingPath, setAnimatingPath] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    await logOut()
    navigate("/login", { replace: true })
  }

  const handleItemClick = (to: string, isLogout?: boolean) => {
    if (animatingPath) return
    setAnimatingPath(to)
    setTimeout(async () => {
      if (isLogout) {
        await handleLogout()
      } else {
        navigate(to)
      }
    }, 600)
  }

  const displayedItems = MENU_ITEMS

  // Fan / Coverflow transform generator
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex
    const absDiff = Math.abs(diff)
    
    // Arch height adjustment
    const translateY = absDiff * 18
    // Rotation for fan shape
    const rotateZ = diff * 8
    // Horizontal overlapping offset
    const translateX = diff * 65
    // Card scale factor
    const scale = 1 - absDiff * 0.08
    const zIndex = 10 - absDiff

    return {
      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotateZ}deg) scale(${scale})`,
      opacity: 1,
      zIndex,
      transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
    }
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (animatingPath) return
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : 0))
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayedItems.length - 1))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-0 sm:px-4">
      {/* Title & Subtitle */}
      <div className={`text-center max-w-2xl mb-12 transition-all duration-500 ease-out ${
        animatingPath ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
      }`}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          RU Track Workspace
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          พื้นที่จัดการตัวเองสำหรับนักศึกษา บันทึกความคืบหน้า วางแผนตารางเวลา และเตรียมพร้อมสำหรับทุกการสอบ
        </p>
      </div>

      {/* DESKTOP VIEW: 6-Card Expandable Menu Layout */}
      {pageLoading ? (
        <div className="hidden md:flex gap-1.5 w-full max-w-5xl h-[420px]">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-xl h-full" />
          ))}
        </div>
      ) : (
        <div className={`hidden md:flex flex-col md:flex-row w-full max-w-5xl h-[420px] transition-all duration-500 ${
          animatingPath ? "gap-0" : "gap-1.5"
        }`}>
          {displayedItems.map((item, index) => {
            const Icon = item.icon
            const isSelected = animatingPath === item.to
            const isAnySelected = animatingPath !== null

            const cardContent = (
              <>
                {/* Card Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />

                {/* Clean Dark Overlay */}
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isSelected ? 'bg-black/10' : 'bg-black/15 group-hover:bg-black/30'
                }`} />

                {/* Centered Icon - replaces text name on the card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-md border text-white shadow-md transition-all duration-300 ${
                    isSelected
                      ? "bg-white text-slate-900 border-white scale-125"
                      : "bg-white/20 border-white/20 group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900 group-hover:border-white"
                  }`}>
                    <Icon className="size-6" />
                  </div>
                </div>

                {/* Subtle Tooltip Label shown on hover at the bottom */}
                <div className={`absolute bottom-5 left-0 right-0 text-center transition-all duration-300 pointer-events-none ${
                  isSelected
                    ? "opacity-100 translate-y-0"
                    : isAnySelected
                      ? "opacity-0"
                      : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                }`}>
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white tracking-wide uppercase">
                    {item.label}
                  </span>
                </div>
              </>
            )

            let cardClasses = "relative group rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800/60 transition-all cursor-pointer h-full"
            let cardStyle: React.CSSProperties = {
              transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }

            if (isAnySelected) {
              if (isSelected) {
                cardStyle = {
                  flex: 3,
                  transform: "scale(1.05)",
                  zIndex: 30,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }
              } else {
                cardStyle = {
                  flex: 0,
                  width: "0px",
                  opacity: 0,
                  pointerEvents: "none",
                  transform: "scale(0.95)",
                  transition: "all 0.5s ease-out",
                }
              }
            } else {
              cardStyle = {
                flex: 1,
                transition: "all 0.5s ease-out",
              }
              cardClasses += " flex-1 hover:flex-[1.8]"
            }

            return (
              <div
                key={index}
                onClick={() => handleItemClick(item.to, item.isLogout)}
                style={cardStyle}
                className={cardClasses}
              >
                {cardContent}
              </div>
            )
          })}
        </div>
      )}

      {/* MOBILE VIEW: Beautiful cover-flow fan/arch style with white background */}
      {pageLoading ? (
        <div className="md:hidden flex flex-col items-center justify-center -mx-4 w-[calc(100%+2rem)] bg-white dark:bg-slate-900 py-10 px-0 overflow-x-hidden">
          <div className="relative w-full h-[380px] flex items-center justify-center">
            <Skeleton className="w-[180px] h-[280px] rounded-2xl" />
          </div>
          <div className="flex items-center gap-6 mt-6">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-2 w-24 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ) : (
        <div 
          className="md:hidden flex flex-col items-center justify-center -mx-4 w-[calc(100%+2rem)] bg-white dark:bg-slate-900 py-10 px-0 overflow-x-hidden select-none touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Card Stage */}
          <div className="relative w-full h-[380px] flex items-center justify-center">
            {displayedItems.map((item, index) => {
              const Icon = item.icon
              const isActive = index === activeIndex
              const isSelected = animatingPath === item.to
              const isAnySelected = animatingPath !== null

              let cardStyle: React.CSSProperties
              if (isAnySelected) {
                if (isSelected) {
                  cardStyle = {
                    transform: `translateX(0px) translateY(-15px) rotate(0deg) scale(1.18)`,
                    opacity: 1,
                    zIndex: 50,
                    transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }
                } else {
                  const normalStyle = getCardStyle(index)
                  cardStyle = {
                    ...normalStyle,
                    opacity: 0,
                    transform: normalStyle.transform + " scale(0.8) translateY(30px)",
                    transition: "all 0.5s ease-out",
                  }
                }
              } else {
                cardStyle = getCardStyle(index)
              }

              return (
                <div
                  key={index}
                  style={cardStyle}
                  onClick={() => {
                    if (isAnySelected) return
                    if (isActive) {
                      handleItemClick(item.to, item.isLogout)
                    } else {
                      setActiveIndex(index)
                    }
                  }}
                  className="absolute w-[180px] h-[280px] rounded-2xl overflow-hidden shadow-md border border-white/20 cursor-pointer origin-bottom"
                >
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  
                  {/* Dark Overlay */}
                  <div className={`absolute inset-0 transition-colors duration-300 ${
                    isSelected ? 'bg-black/10' : isActive ? 'bg-black/20' : 'bg-black/45'
                  }`} />

                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-white text-slate-900 scale-110'
                        : isActive
                          ? 'bg-white text-slate-900 scale-100'
                          : 'bg-white/20 backdrop-blur-sm text-white scale-90'
                    }`}>
                      <Icon className="size-7" />
                    </div>
                  </div>

                  {/* Label (only shown for active card) */}
                  {isActive && !isAnySelected && (
                    <div className="absolute bottom-5 left-0 right-0 text-center animate-fade-in">
                      <span className="inline-block px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white tracking-wide uppercase">
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Navigation & Pagination */}
          <div className={`flex items-center gap-6 mt-6 transition-all duration-500 ${
            animatingPath ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100 translate-y-0"
          }`}>
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
      )}
    </div>
  )
}
