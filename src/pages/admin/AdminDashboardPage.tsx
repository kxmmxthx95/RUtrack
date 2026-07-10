import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Library, Users } from "lucide-react"
import { countMasterCourses, countUsers } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [courseCount, setCourseCount] = useState<number | null>(null)

  useEffect(() => {
    countUsers().then(setUserCount).catch(() => setUserCount(0))
    countMasterCourses().then(setCourseCount).catch(() => setCourseCount(0))
  }, [])

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        ภาพรวมระบบข้อมูลหลักของมหาวิทยาลัยรามคำแหง
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Users className="size-4" /> ผู้ใช้งานที่ลงทะเบียนทั้งหมด
            </CardDescription>
            <CardTitle className="text-4xl">
              {userCount === null ? <Skeleton className="h-10 w-16" /> : userCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link to="/admin/users">
                ดูผู้ใช้งาน <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Library className="size-4" /> คลังรายวิชาทั้งหมด
            </CardDescription>
            <CardTitle className="text-4xl">
              {courseCount === null ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                courseCount
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link to="/admin/master-courses">
                จัดการคลังรายวิชา <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
