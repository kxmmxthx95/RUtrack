import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, Minus, RotateCcw, TrendingUp } from "lucide-react"
import { useCourses } from "@/hooks/useCourses"
import { GRADE_POINTS, type Course, type Grade } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** Grades offered in the predictor, per RU grading scale. */
const PREDICTOR_GRADES: Grade[] = ["A", "B+", "B", "C+", "C", "D+", "D"]

interface GpaInput {
  points: number
  credits: number
}

function gpax({ points, credits }: GpaInput): number | null {
  return credits > 0 ? points / credits : null
}

function formatGpa(value: number | null): string {
  return value === null ? "—" : value.toFixed(2)
}

export default function GradesPage() {
  const { courses, loading } = useCourses()
  const [predictions, setPredictions] = useState<Record<string, Grade>>({})

  const graded = useMemo(
    () => courses.filter((c) => c.grade && c.status !== "enrolled"),
    [courses],
  )
  const enrolled = useMemo(
    () => courses.filter((c) => c.status === "enrolled"),
    [courses],
  )

  const current = useMemo<GpaInput>(
    () =>
      graded.reduce(
        (acc, c) => ({
          points: acc.points + GRADE_POINTS[c.grade as Grade] * c.credits,
          credits: acc.credits + c.credits,
        }),
        { points: 0, credits: 0 },
      ),
    [graded],
  )

  const projected = useMemo<GpaInput>(
    () =>
      enrolled.reduce((acc, c) => {
        const predicted = c.id ? predictions[c.id] : undefined
        if (!predicted) return acc
        return {
          points: acc.points + GRADE_POINTS[predicted] * c.credits,
          credits: acc.credits + c.credits,
        }
      }, current),
    [enrolled, predictions, current],
  )

  const currentGpax = gpax(current)
  const projectedGpax = gpax(projected)
  const delta =
    currentGpax !== null && projectedGpax !== null
      ? projectedGpax - currentGpax
      : null
  const predictedCount = enrolled.filter(
    (c) => c.id && predictions[c.id],
  ).length

  function setPrediction(course: Course, grade: Grade) {
    if (!course.id) return
    const id = course.id
    setPredictions((prev) =>
      prev[id] === grade
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
        : { ...prev, [id]: grade },
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">เกรด</h1>
        <p className="text-muted-foreground">
          ติดตาม GPAX และจำลองผลการเรียนเทอมนี้
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>GPAX ปัจจุบัน</CardDescription>
            <CardTitle className="text-4xl">{formatGpa(currentGpax)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              จาก {graded.length} รายวิชาที่มีเกรดแล้ว ({current.credits} หน่วยกิต)
            </p>
          </CardContent>
        </Card>
        <Card className={cn(predictedCount > 0 && "border-primary/50")}>
          <CardHeader>
            <CardDescription>GPAX ที่คาดการณ์</CardDescription>
            <CardTitle className="flex items-center gap-3 text-4xl">
              {formatGpa(projectedGpax)}
              {delta !== null && predictedCount > 0 && (
                <Badge
                  variant={delta >= 0 ? "secondary" : "destructive"}
                  className="gap-1"
                >
                  {delta > 0.004 ? (
                    <ArrowUp className="size-3" />
                  ) : delta < -0.004 ? (
                    <ArrowDown className="size-3" />
                  ) : (
                    <Minus className="size-3" />
                  )}
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(2)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {predictedCount === 0
                ? "เลือกเกรดที่คาดการณ์ด้านล่างเพื่อจำลองผล"
                : `กำลังจำลอง ${predictedCount} จาก ${enrolled.length} รายวิชาที่กำลังเรียน`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>หน่วยกิตที่สำเร็จแล้ว</CardDescription>
            <CardTitle className="text-4xl">{current.credits}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              +{enrolled.reduce((s, c) => s + c.credits, 0)} หน่วยกิตกำลังเรียน
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" /> ตัวคาดการณ์เกรด
              </CardTitle>
              <CardDescription>
                แตะเกรดของแต่ละวิชาที่กำลังเรียนเพื่อดู GPAX จำลอง
                แตะอีกครั้งเพื่อล้างค่า
              </CardDescription>
            </div>
            {predictedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPredictions({})}
              >
                <RotateCcw className="size-4" /> รีเซ็ต
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {enrolled.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              ไม่มีรายวิชาที่กำลังเรียนให้จำลอง กรุณาเพิ่มรายวิชาที่มีสถานะ
              "กำลังเรียน" ก่อน
            </p>
          ) : (
            <div className="space-y-3">
              {enrolled.map((course) => {
                const selected = course.id
                  ? predictions[course.id]
                  : undefined
                return (
                  <div
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {course.course_code}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {course.name}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {course.credits} หน่วยกิต
                        {selected &&
                          ` · คาดการณ์ ${selected} (${GRADE_POINTS[selected].toFixed(1)})`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PREDICTOR_GRADES.map((g) => (
                        <Button
                          key={g}
                          variant={selected === g ? "default" : "outline"}
                          size="sm"
                          className="w-11"
                          onClick={() => setPrediction(course, g)}
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายวิชาที่เรียนจบแล้ว</CardTitle>
          <CardDescription>
            รายวิชาที่มีเกรดแล้ว นับรวมใน GPAX ของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {graded.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              ยังไม่มีรายวิชาที่มีเกรด กรุณาตั้งสถานะวิชาเป็นผ่านแล้ว/ไม่ผ่าน
              และเลือกเกรดในหน้ารายวิชา
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead className="text-right">หน่วยกิต</TableHead>
                    <TableHead className="text-right">เกรด</TableHead>
                    <TableHead className="text-right">แต้ม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {graded.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.course_code}
                      </TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-right">{c.credits}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            c.grade === "F" ? "destructive" : "secondary"
                          }
                        >
                          {c.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {(GRADE_POINTS[c.grade as Grade] * c.credits).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
