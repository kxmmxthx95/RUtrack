import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 100

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance

    if (isRightSwipe && location.pathname !== "/") {
      navigate("/")
    }
  }

  const isLockedPage = location.pathname === "/" || location.pathname === "/profile"

  return (
    <div 
      className={
        isLockedPage
          ? "h-[100dvh] overflow-hidden overscroll-none bg-muted/40 dark:bg-slate-950 flex flex-col"
          : "min-h-screen bg-muted/40 dark:bg-slate-950 overflow-x-hidden"
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <main 
        className={
          isLockedPage
            ? "mx-auto w-full max-w-6xl h-full flex flex-col justify-center px-4 py-4"
            : "mx-auto max-w-6xl px-4 py-8"
        }
      >
        <div 
          key={location.pathname} 
          className={
            isLockedPage
              ? "h-full flex flex-col justify-center animate-page-in"
              : "animate-page-in"
          }
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
