import { useAuth } from "@/contexts/AuthContext"
import { StudentCard } from "@/components/profile/StudentCard"

export default function ProfilePage() {
  const { profile } = useAuth()

  if (!profile) return null

  const displayName =
    [profile.title, profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "ไม่ระบุชื่อ"

  return (
    <div className="mx-auto max-w-2xl pt-4">
      <StudentCard
        profile={profile}
        displayName={displayName}
      />
    </div>
  )
}
