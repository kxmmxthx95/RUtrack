import { Link } from "react-router-dom"
import { BookOpen, Pencil, Trash2 } from "lucide-react"
import { useMilestones } from "@/hooks/useCourses"
import type { Course, CourseStatus } from "@/types"
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

const STATUS_STYLES: Record<
  CourseStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  enrolled: { label: "กำลังเรียน", variant: "default" },
  passed: { label: "ผ่านแล้ว", variant: "secondary" },
  failed: { label: "ไม่ผ่าน", variant: "destructive" },
}

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const { milestones } = useMilestones(course.id)
  const done = milestones.filter((m) => m.is_completed).length
  const progress =
    milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0
  const status = STATUS_STYLES[course.status]

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardDescription>{course.course_code}</CardDescription>
            <CardTitle className="text-lg">{course.name}</CardTitle>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{course.credits} หน่วยกิต</span>
          {course.grade && <span>เกรด: {course.grade}</span>}
          <span>
            {done}/{milestones.length} เป้าหมาย
          </span>
        </div>
        <Progress value={progress} />
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/courses/${course.id}`}>
              <BookOpen className="size-4" /> เป้าหมาย
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(course)}>
            <Pencil className="size-4" />
            <span className="sr-only">แก้ไข</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(course)}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">ลบ</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
