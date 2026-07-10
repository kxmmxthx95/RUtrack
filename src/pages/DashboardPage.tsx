import { Link } from "react-router-dom"
import {
  IoArrowForwardOutline as ArrowRight,
  IoBookOutline as BookOpen,
  IoSchoolOutline as GraduationCap,
} from "react-icons/io5"
import { useAuth } from "@/contexts/AuthContext"
import { useCourses } from "@/hooks/useCourses"
import { DEGREE_TOTAL_CREDITS } from "@/lib/courses"
import type { CourseStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_VARIANT: Record<
  CourseStatus,
  "default" | "secondary" | "destructive"
> = {
  enrolled: "default",
  passed: "secondary",
  failed: "destructive",
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { courses, loading } = useCourses()

  const enrolled = courses.filter((c) => c.status === "enrolled")
  const earnedCredits = courses
    .filter((c) => c.status === "passed")
    .reduce((sum, c) => sum + c.credits, 0)
  const enrolledCredits = enrolled.reduce((sum, c) => sum + c.credits, 0)
  const creditProgress = Math.min(
    Math.round((earnedCredits / DEGREE_TOTAL_CREDITS) * 100),
    100,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          {profile
            ? `ชั้นปีที่ ${profile.academic_year} · ${profile.faculty} · ${profile.major}`
            : "ยินดีต้อนรับสู่ RU Track"}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardDescription>ความคืบหน้าการเรียน</CardDescription>
            <CardTitle className="text-4xl">
              {loading ? (
                <Skeleton className="h-10 w-40" />
              ) : (
                <>
                  {earnedCredits}
                  <span className="text-xl font-normal text-muted-foreground">
                    {" "}
                    / {DEGREE_TOTAL_CREDITS} หน่วยกิต
                  </span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={loading ? 0 : creditProgress} />
            <p className="mt-2 text-sm text-muted-foreground">
              {creditProgress}% ของหน่วยกิตที่ต้องใช้ทั้งหมด
              {enrolledCredits > 0 &&
                ` · กำลังเรียนอีก ${enrolledCredits} หน่วยกิตในเทอมนี้`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          ลงทะเบียนเรียนเทอมนี้ ({enrolled.length})
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/courses">
            จัดการรายวิชา <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : enrolled.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <GraduationCap className="size-6" />
            </div>
            <p className="font-medium">ยังไม่มีรายวิชาที่ลงทะเบียน</p>
            <p className="text-sm text-muted-foreground">
              เพิ่มรายวิชาที่คุณกำลังเรียนในเทอมนี้
            </p>
            <Button asChild variant="outline" className="mt-1">
              <Link to="/courses">
                <BookOpen className="size-4" /> ไปที่รายวิชา
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardDescription>{course.course_code}</CardDescription>
                      <CardTitle className="text-base">
                        {course.name}
                      </CardTitle>
                    </div>
                    <Badge variant={STATUS_VARIANT[course.status]}>
                      {course.credits} นก.
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
