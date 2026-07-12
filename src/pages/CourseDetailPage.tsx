import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { doc, onSnapshot } from "firebase/firestore"
import {
  IoArrowBackOutline as ArrowLeft,
  IoBookmarkOutline as BookMarked,
  IoTimeOutline as CalendarClock,
  IoClipboardOutline as ClipboardList,
  IoHelpCircleOutline as FileQuestion,
  IoSchoolOutline as GraduationCap,
  IoPencilOutline as Pencil,
  IoAddOutline as Plus,
  IoTrashOutline as Trash2,
} from "react-icons/io5"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { deleteMilestone, updateMilestone } from "@/lib/courses"
import { useMilestones } from "@/hooks/useCourses"
import { MILESTONE_TYPES } from "@/components/courses/MilestoneFormDialog"
import type { Course, Milestone } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { MilestoneFormDialog } from "@/components/courses/MilestoneFormDialog"

const TYPE_ICONS: Record<Milestone["milestone_type"], typeof BookMarked> = {
  reading: BookMarked,
  assignment: ClipboardList,
  review: CalendarClock,
  exam: GraduationCap,
  other: FileQuestion,
}

const TYPE_LABELS: Record<Milestone["milestone_type"], string> =
  Object.fromEntries(MILESTONE_TYPES.map((t) => [t.value, t.label])) as Record<
    Milestone["milestone_type"],
    string
  >

export default function CourseDetailPage() {
  const { user } = useAuth()
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(true)
  const { milestones, loading: milestonesLoading } = useMilestones(courseId)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Milestone | null>(null)

  useEffect(() => {
    if (!courseId || !user) return
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid, "courses", courseId),
      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() } as Course)
        } else {
          toast.error("ไม่พบรายวิชานี้")
          navigate("/courses", { replace: true })
        }
        setCourseLoading(false)
      },
      () => {
        toast.error("คุณไม่มีสิทธิ์เข้าถึงรายวิชานี้")
        navigate("/courses", { replace: true })
      },
    )
    return unsubscribe
  }, [courseId, navigate, user])

  const done = milestones.filter((m) => m.is_completed).length
  const progress =
    milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0

  async function toggleComplete(m: Milestone) {
    if (!courseId || !m.id || !user) return
    try {
      await updateMilestone(user.uid, courseId, m.id, {
        is_completed: !m.is_completed,
      })
    } catch {
      toast.error("อัปเดตเป้าหมายไม่สำเร็จ")
    }
  }

  async function handleDelete(m: Milestone) {
    if (!courseId || !m.id || !user) return
    try {
      await deleteMilestone(user.uid, courseId, m.id)
      toast.success("ลบเป้าหมายแล้ว")
    } catch {
      toast.error("ลบเป้าหมายไม่สำเร็จ")
    }
  }

  if (courseLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/courses">
          <ArrowLeft className="size-4" /> กลับไปที่รายวิชา
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardDescription>{course.course_code}</CardDescription>
              <CardTitle className="text-2xl">{course.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{course.credits} หน่วยกิต</Badge>
              {course.grade && <Badge>เกรด {course.grade}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ความคืบหน้าการเรียน</span>
            <span className="font-medium">
              เสร็จแล้ว {done}/{milestones.length} ({progress}%)
            </span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">เป้าหมาย</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" /> เพิ่มเป้าหมาย
        </Button>
      </div>

      {milestonesLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : milestones.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            ยังไม่มีเป้าหมาย เพิ่มเป้าหมาย เช่น "อ่านบทที่ 1-3"
            เพื่อติดตามความคืบหน้าของวิชานี้
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => {
            const Icon = TYPE_ICONS[m.milestone_type] ?? FileQuestion
            const overdue =
              !m.is_completed && m.target_date.toDate() < new Date()
            return (
              <Card key={m.id} className="py-3">
                <CardContent className="flex items-center gap-4 px-4">
                  <Checkbox
                    checked={m.is_completed}
                    onCheckedChange={() => toggleComplete(m)}
                    aria-label={`ทำเครื่องหมาย ${m.title} ว่า${m.is_completed ? "ยังไม่เสร็จ" : "เสร็จแล้ว"}`}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className={
                          m.is_completed
                            ? "truncate font-medium text-muted-foreground line-through"
                            : "truncate font-medium"
                        }
                      >
                        {m.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span>{TYPE_LABELS[m.milestone_type]}</span>
                        {" · "}
                        <span className={overdue ? "text-destructive" : ""}>
                          {m.target_date.toDate().toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {overdue && " (เลยกำหนด)"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(m)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">แก้ไข</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(m)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">ลบ</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {courseId && (
        <MilestoneFormDialog
          courseId={courseId}
          open={formOpen}
          onOpenChange={setFormOpen}
          milestone={editing}
        />
      )}
    </div>
  )
}
