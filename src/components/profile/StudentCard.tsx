import { useState, useEffect } from "react"
import { IoSyncOutline } from "react-icons/io5"
import type { UserProfile } from "@/types"

const CAMPUS_LABELS: Record<string, string> = {
  main: "วิทยาเขตหลัก",
  bangna: "วิทยาเขตบางนา",
  regional: "วิทยาเขตภูมิภาค",
  online: "เรียนออนไลน์",
}

interface FacultyTheme {
  bg: string
  text: string
  subText: string
  badge: string
}

const getFacultyTheme = (faculty: string = "", major: string = ""): FacultyTheme => {
  const f = (faculty || "").toLowerCase()
  const m = (major || "").toLowerCase()

  // 1. สาขาวิชารัฐประศาสนศาสตร์ (สีน้ำตาล #996633)
  if (m.includes("รัฐประศาสนศาสตร์") || m.includes("public administration")) {
    return {
      bg: "linear-gradient(135deg, #d9a066 0%, #663300 100%)",
      text: "text-white",
      subText: "text-white/70",
      badge: "bg-white/15 text-white"
    }
  }

  // 2. คณะนิติศาสตร์ (สีขาว #FFFFFF)
  if (f.includes("นิติศาสตร์") || f.includes("law")) {
    return {
      bg: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
      text: "text-slate-900",
      subText: "text-slate-500",
      badge: "bg-slate-900/10 text-slate-800"
    }
  }

  // 3. คณะบริหารธุรกิจ (สีฟ้า #3399FF)
  if (f.includes("บริหารธุรกิจ") || f.includes("business")) {
    return {
      bg: "linear-gradient(135deg, #80c0ff 0%, #004d99 100%)",
      text: "text-white",
      subText: "text-white/80",
      badge: "bg-white/20 text-white"
    }
  }

  // 4. คณะรัฐศาสตร์ (สีแดงเข้ม #CC0000)
  if (f.includes("รัฐศาสตร์") || f.includes("political")) {
    return {
      bg: "linear-gradient(135deg, #ff4d4d 0%, #800000 100%)",
      text: "text-white",
      subText: "text-white/70",
      badge: "bg-white/15 text-white"
    }
  }

  // 5. คณะศึกษาศาสตร์ (สีชมพู #FF66CC)
  if (f.includes("ศึกษาศาสตร์") || f.includes("education")) {
    return {
      bg: "linear-gradient(135deg, #ffb3e6 0%, #b30086 100%)",
      text: "text-white",
      subText: "text-white/80",
      badge: "bg-white/15 text-white"
    }
  }

  // 6. คณะทัศนมาตรศาสตร์ (สีเขียว #339933)
  if (f.includes("ทัศนมาตรศาสตร์") || f.includes("optometry")) {
    return {
      bg: "linear-gradient(135deg, #80e680 0%, #134d13 100%)",
      text: "text-white",
      subText: "text-white/80",
      badge: "bg-white/15 text-white"
    }
  }

  // 7. คณะวิทยาศาสตร์ (สีเหลือง #FFCC00)
  if (f.includes("วิทยาศาสตร์") || f.includes("science")) {
    return {
      bg: "linear-gradient(135deg, #fff2b3 0%, #cc9900 100%)",
      text: "text-slate-900",
      subText: "text-slate-600",
      badge: "bg-slate-900/10 text-slate-800"
    }
  }

  // 8. คณะเศรษฐศาสตร์ (สีม่วง #9933CC)
  if (f.includes("เศรษฐศาสตร์") || f.includes("economics")) {
    return {
      bg: "linear-gradient(135deg, #df9fdf 0%, #4d0080 100%)",
      text: "text-white",
      subText: "text-white/70",
      badge: "bg-white/15 text-white"
    }
  }

  // 9. คณะมนุษยศาสตร์ (สีแสด #FF6600)
  if (f.includes("มนุษยศาสตร์") || f.includes("humanities")) {
    return {
      bg: "linear-gradient(135deg, #ffb380 0%, #b33600 100%)",
      text: "text-white",
      subText: "text-white/80",
      badge: "bg-white/20 text-white"
    }
  }

  // 10. คณะวิศวกรรมศาสตร์ (สีเลือดหมู #800000)
  if (f.includes("วิศวกรรมศาสตร์") || f.includes("engineering")) {
    return {
      bg: "linear-gradient(135deg, #ff6666 0%, #4d0000 100%)",
      text: "text-white",
      subText: "text-white/70",
      badge: "bg-white/15 text-white"
    }
  }

  // 11. คณะพัฒนาทรัพยากรมนุษย์ (สีเทา #999999)
  if (f.includes("พัฒนาทรัพยากรมนุษย์") || f.includes("human resource")) {
    return {
      bg: "linear-gradient(135deg, #e2e8f0 0%, #475569 100%)",
      text: "text-white",
      subText: "text-white/80",
      badge: "bg-white/15 text-white"
    }
  }

  // 12. คณะสื่อสารมวลชน (สีเขียวตองอ่อน #99CC66)
  if (f.includes("สื่อสารมวลชน") || f.includes("mass communication")) {
    return {
      bg: "linear-gradient(135deg, #e6ffcc 0%, #558000 100%)",
      text: "text-slate-900",
      subText: "text-slate-600",
      badge: "bg-slate-900/10 text-slate-800"
    }
  }

  // 13. คณะศิลปกรรมศาสตร์ (สีครีมทอง #E6C280)
  if (f.includes("ศิลปกรรมศาสตร์") || f.includes("fine arts")) {
    return {
      bg: "linear-gradient(135deg, #fcf3e3 0%, #b38633 100%)",
      text: "text-slate-900",
      subText: "text-slate-600",
      badge: "bg-slate-900/10 text-slate-800"
    }
  }

  // Default theme (RU Track Blue)
  return {
    bg: "linear-gradient(135deg, #80aaff 0%, #0033aa 100%)",
    text: "text-white",
    subText: "text-white/80",
    badge: "bg-white/15 text-white"
  }
}

interface StudentCardProps {
  profile: UserProfile
  displayName: string
}

export function StudentCard({
  profile,
  displayName,
}: StudentCardProps) {
  const [isLandscape, setIsLandscape] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(media.matches)
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  const handleCardClick = () => {
    if (isDesktop) {
      setFlipped((f) => !f)
    } else {
      if (!isLandscape) {
        setIsLandscape(true)
      } else if (!flipped) {
        setFlipped(true)
      } else {
        setFlipped(false)
        setIsLandscape(false)
      }
    }
  }

  const getTransform = () => {
    if (isDesktop) {
      return `translate(-50%, 20px) rotate(0deg) scale(1.15) rotateY(${flipped ? 180 : 0}deg)`
    }
    return !isLandscape
      ? "translate(-50%, 270px) rotate(-90deg) scale(1.75)"
      : `translate(-50%, 20px) rotate(0deg) scale(1.15) rotateY(${flipped ? 180 : 0}deg)`
  }

  const theme = getFacultyTheme(profile.faculty, profile.major)

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className={`text-center mb-2 lg:hidden transition-all duration-500 ease-in-out ${
          isLandscape 
            ? "opacity-0 -translate-y-4 pointer-events-none max-h-0 mb-0 overflow-hidden" 
            : "opacity-100 translate-y-0 max-h-20"
        }`}
      >
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">แตะที่บัตร</h1>
        <p className="text-base text-slate-500 dark:text-slate-400 mt-1.5">เพื่อดูข้อมูลส่วนตัว</p>
      </div>

      <div className="relative w-full h-[600px] lg:h-[300px] max-w-sm mx-auto select-none [perspective:1600px]">
        <div
          onClick={handleCardClick}
          className="absolute left-1/2 top-0 w-[320px] h-[202px] cursor-pointer rounded-2xl text-left outline-none [transform-style:preserve-3d]"
          style={{
            transform: getTransform(),
            transition: "transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {/* Front */}
          <div 
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-lg [backface-visibility:hidden] ${theme.text}`}
            style={{ 
              background: theme.bg,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
          >
            {/* Premium Card Patterns */}
            <div className="absolute -left-10 -top-20 w-[140%] h-[200px] bg-white/10 rounded-[80px] -rotate-12 pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-[130%] h-[160px] bg-black/10 rounded-[100px] -rotate-45 pointer-events-none" />
            <div className="absolute right-4 -top-10 w-[200px] h-[150px] bg-white/10 rounded-full blur-md pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-[180px] h-[180px] bg-black/15 rounded-full blur-lg pointer-events-none" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${theme.subText}`}>
                  RU Track
                </p>
                <p className="text-xs">บัตรประจำตัวนักศึกษา</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${theme.badge}`}>
                {profile.campus_type === "regional"
                  ? (profile.additional_info?.province || "ภูมิภาค")
                  : (CAMPUS_LABELS[profile.campus_type] ?? profile.campus_type)}
              </span>
            </div>

            <div className="relative">
              <p className="font-mono text-lg tracking-[0.2em]">
                {profile.student_id}
              </p>
              <p className="mt-1 truncate text-lg font-bold">{displayName}</p>
              <p className={`truncate text-xs ${theme.subText}`}>
                {profile.faculty} · {profile.major}
              </p>
            </div>

            <div className="relative flex items-center justify-center text-xs">
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                theme.text === "text-white" ? "bg-black/20 text-white/80" : "bg-black/5 text-slate-700"
              }`}>
                <IoSyncOutline className="size-3.5 transition-transform duration-500" />
                {isDesktop
                  ? "แตะเพื่อพลิกดูหลังบัตร"
                  : !isLandscape 
                  ? "แตะเพื่อแสดงแนวนอน" 
                  : "แตะเพื่อพลิกดูหลังบัตร"}
              </span>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 flex flex-col justify-center rounded-2xl p-6 shadow-lg [backface-visibility:hidden] ${theme.text} overflow-hidden`}
            style={{ 
              background: theme.bg,
              transform: "rotateY(180deg)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
          >
            {/* Premium Card Patterns */}
            <div className="absolute -left-10 -top-20 w-[140%] h-[200px] bg-white/10 rounded-[80px] -rotate-12 pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-[130%] h-[160px] bg-black/10 rounded-[100px] -rotate-45 pointer-events-none" />
            <div className="absolute right-4 -top-10 w-[200px] h-[150px] bg-white/10 rounded-full blur-md pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-[180px] h-[180px] bg-black/15 rounded-full blur-lg pointer-events-none" />

            <div className="relative space-y-3 text-[13px]">
              <div className="flex justify-between items-center gap-4">
                <span className={`${theme.subText} shrink-0`}>วิทยาเขต</span>
                <span className="font-semibold text-right truncate">
                  {CAMPUS_LABELS[profile.campus_type] ?? profile.campus_type}
                </span>
              </div>
              {profile.campus_type === "regional" && (
                <div className="flex justify-between items-center gap-4">
                  <span className={`${theme.subText} shrink-0`}>จังหวัด</span>
                  <span className="font-semibold text-right truncate">
                    {profile.additional_info?.province || "-"}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center gap-4">
                <span className={`${theme.subText} shrink-0`}>คณะ</span>
                <span className="font-semibold text-right truncate">{profile.faculty || "-"}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className={`${theme.subText} shrink-0`}>หลักสูตร</span>
                <span className="font-semibold text-right truncate">{profile.program || "-"}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className={`${theme.subText} shrink-0`}>สาขาวิชา</span>
                <span className="font-semibold text-right truncate">{profile.major || "-"}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className={`${theme.subText} shrink-0`}>เบอร์โทรศัพท์</span>
                <span className="font-semibold text-right font-mono">{profile.phone_number || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Text */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 text-center transition-all duration-500 ease-in-out pointer-events-none ${
            isDesktop
              ? "bottom-2 opacity-100 translate-y-0"
              : isLandscape
              ? "top-[270px] opacity-100 translate-y-0 delay-700"
              : "top-[270px] opacity-0 -translate-y-2 delay-0"
          }`}
        >
          <p className="text-[11px] text-slate-400/80 dark:text-slate-500/80 whitespace-nowrap">
            กรุณาตรวจสอบข้อมูลให้ตรงกับเว็บไซต์หลักของทางมหาวิทยาลัย
          </p>
        </div>
      </div>
    </div>
  )
}
