import { useEffect, useMemo, useState } from "react"
import { IoBookOutline as BookOpen, IoAddOutline as Plus } from "react-icons/io5"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { useCourses } from "@/hooks/useCourses"
import { deleteCourse } from "@/lib/courses"
import {
  extractAcademicYearFromStudentId,
  listenToCurriculumCourses,
  type CurriculumNodeKey,
} from "@/lib/curriculum"
import { SUBCATEGORIES } from "@/lib/courseCategories"
import { CAMPUS_LABELS, type CampusCatalogKey } from "@/lib/universityCatalog"
import type { Course, CurriculumCourse } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/courses/CourseCard"
import { CourseFormDialog } from "@/components/courses/CourseFormDialog"

type Filter = "all" | "enrolled" | "passed" | "failed"

const CATEGORY_GROUPS: { key: string; label: string; color: string }[] = [
  { key: "general", label: "หมวดวิชาทั่วไป", color: "bg-blue-500" },
  { key: "specialized", label: "วิชาเฉพาะ", color: "bg-violet-500" },
  { key: "free_elective", label: "หมวดวิชาเลือกเสรี", color: "bg-emerald-500" },
]

function useMatchedCurriculumNode(): CurriculumNodeKey | null {
  const { profile } = useAuth()
  return useMemo(() => {
    if (!profile || profile.campus_type === "online") return null
    const cohortYear = extractAcademicYearFromStudentId(profile.student_id)
    if (!cohortYear) return null
    return {
      campus: profile.campus_type as CampusCatalogKey,
      academicYear: cohortYear,
      faculty: profile.faculty,
      major: profile.major,
    }
  }, [profile])
}

function CurriculumSummaryCard({ myCourses }: { myCourses: Course[] }) {
  const node = useMatchedCurriculumNode()
  const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!node) {
      setCurriculumCourses([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = listenToCurriculumCourses(node, (data) => {
      setCurriculumCourses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [node])

  const totalCredits = curriculumCourses.reduce((s, c) => s + (c.credits ?? 0), 0)
  const earnedCredits = myCourses
    .filter((c) => c.status === "passed")
    .reduce((s, c) => s + (c.credits ?? 0), 0)
  const earnedProgress =
    totalCredits > 0 ? Math.min(100, Math.round((earnedCredits / totalCredits) * 100)) : 0

  const groups = CATEGORY_GROUPS.map((g) => ({
    ...g,
    credits: SUBCATEGORIES[g.key].reduce(
      (sum, s) =>
        sum +
        curriculumCourses
          .filter((c) => c.course_category === s.value)
          .reduce((n, c) => n + (c.credits ?? 0), 0),
      0,
    ),
  })).filter((g) => g.credits > 0)

  return (
    <Card className="py-4">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">สรุปหลักสูตร</p>
            {node && (
              <p className="text-xs text-muted-foreground">
                {CAMPUS_LABELS[node.campus]} &rsaquo; รหัสนักศึกษาปี {node.academicYear}{" "}
                &rsaquo; {node.faculty} &rsaquo; {node.major}
              </p>
            )}
          </div>
          {!loading && totalCredits > 0 && (
            <span className="text-2xl font-bold tabular-nums">
              {totalCredits}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                หน่วยกิต
              </span>
            </span>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : !node || totalCredits === 0 ? (
          <p className="text-sm text-muted-foreground">
            ยังไม่มีข้อมูลหลักสูตรที่ตรงกับโปรไฟล์ของคุณ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        ) : (
          <>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted gap-0.5">
              {groups.map((g) => (
                <div
                  key={g.key}
                  className={g.color}
                  style={{ width: `${(g.credits / totalCredits) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {groups.map((g) => (
                <span key={g.key} className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${g.color}`} />
                  {g.label} {g.credits} หน่วยกิต
                </span>
              ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">หน่วยกิตที่ผ่านแล้ว</span>
                <span className="font-medium">
                  {earnedCredits}/{totalCredits} หน่วยกิต ({earnedProgress}%)
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${earnedProgress}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function CoursesPage() {
  const { user } = useAuth()
  const { courses, loading } = useCourses()
  const [filter, setFilter] = useState<Filter>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)
  const node = useMatchedCurriculumNode()

  const filtered =
    filter === "all" ? courses : courses.filter((c) => c.status === filter)

  function handleAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleEdit(course: Course) {
    setEditing(course)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting?.id || !user) return
    try {
      await deleteCourse(user.uid, deleting.id)
      toast.success(`ลบ ${deleting.course_code} แล้ว`)
    } catch {
      toast.error("ลบรายวิชาไม่สำเร็จ")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {!node && (
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Button onClick={handleAdd}>
            <Plus className="size-4" /> เพิ่มรายวิชา
          </Button>
        </div>
      )}

      <CurriculumSummaryCard myCourses={courses} />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({courses.length})</TabsTrigger>
          <TabsTrigger value="enrolled">
            กำลังเรียน ({courses.filter((c) => c.status === "enrolled").length})
          </TabsTrigger>
          <TabsTrigger value="passed">
            ผ่านแล้ว ({courses.filter((c) => c.status === "passed").length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            ไม่ผ่าน ({courses.filter((c) => c.status === "failed").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <BookOpen className="size-6" />
            </div>
            <p className="font-medium">
              {courses.length === 0
                ? "ยังไม่มีรายวิชา"
                : "ไม่มีรายวิชาในตัวกรองนี้"}
            </p>
            <p className="text-sm text-muted-foreground">
              {courses.length === 0
                ? "เพิ่มรายวิชาที่คุณกำลังเรียนในเทอมนี้เพื่อเริ่มติดตามความคืบหน้า"
                : "ลองเปลี่ยนตัวกรองหรือเพิ่มรายวิชาใหม่"}
            </p>
            {!node && (
              <Button onClick={handleAdd} variant="outline" className="mt-2">
                <Plus className="size-4" /> เพิ่มรายวิชา
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editing}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ลบ {deleting?.course_code}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะลบ "{deleting?.name}" และเป้าหมายทั้งหมดของวิชานี้
              และไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
