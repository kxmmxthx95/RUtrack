import { useState } from "react"
import { IoBookOutline as BookOpen, IoAddOutline as Plus } from "react-icons/io5"
import { toast } from "sonner"
import { useCourses } from "@/hooks/useCourses"
import { deleteCourse } from "@/lib/courses"
import type { Course } from "@/types"
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

export default function CoursesPage() {
  const { courses, loading } = useCourses()
  const [filter, setFilter] = useState<Filter>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState<Course | null>(null)

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
    if (!deleting?.id) return
    try {
      await deleteCourse(deleting.id)
      toast.success(`ลบ ${deleting.course_code} แล้ว`)
    } catch {
      toast.error("ลบรายวิชาไม่สำเร็จ")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">รายวิชา</h1>
          <p className="text-muted-foreground">
            จัดการรายวิชาและเป้าหมายการเรียนของคุณ
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" /> เพิ่มรายวิชา
        </Button>
      </div>

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
            <Button onClick={handleAdd} variant="outline" className="mt-2">
              <Plus className="size-4" /> เพิ่มรายวิชา
            </Button>
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
