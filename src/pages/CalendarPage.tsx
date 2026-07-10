import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  IoCalendarOutline as CalendarDays,
  IoChevronBackOutline as ChevronLeft,
  IoChevronForwardOutline as ChevronRight,
  IoAddOutline as Plus,
} from "react-icons/io5"
import { useCourses } from "@/hooks/useCourses"
import { useExams, type ExamEntry } from "@/hooks/useExams"
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
import { cn } from "@/lib/utils"
import { AddExamDialog } from "@/components/calendar/AddExamDialog"

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysUntil(target: Date): number {
  const ms = startOfDay(target).getTime() - startOfDay(new Date()).getTime()
  return Math.round(ms / 86_400_000)
}

function countdownLabel(days: number): string {
  if (days === 0) return "วันนี้!"
  if (days === 1) return "พรุ่งนี้"
  return `อีก ${days} วัน`
}

export default function CalendarPage() {
  const { courses, loading } = useCourses()
  const exams = useExams(courses)
  const today = startOfDay(new Date())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [addOpen, setAddOpen] = useState(false)
  const [addDate, setAddDate] = useState<string | undefined>()

  const examsByDay = useMemo(() => {
    const map = new Map<string, ExamEntry[]>()
    for (const exam of exams) {
      const key = dateKey(exam.milestone.target_date.toDate())
      map.set(key, [...(map.get(key) ?? []), exam])
    }
    return map
  }, [exams])

  const upcoming = useMemo(
    () =>
      exams.filter(
        (e) => startOfDay(e.milestone.target_date.toDate()) >= today,
      ),
    [exams, today],
  )

  const cells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const result: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(viewYear, viewMonth, d))
    }
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [viewYear, viewMonth])

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  function openAddFor(date?: Date) {
    setAddDate(date ? dateKey(date) : undefined)
    setAddOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ปฏิทินสอบ</h1>
          <p className="text-muted-foreground">
            วันสอบทั้งหมดของทุกรายวิชา
          </p>
        </div>
        <Button onClick={() => openAddFor()} disabled={courses.length === 0}>
          <Plus className="size-4" /> เพิ่มวันสอบ
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              {MONTHS[viewMonth]} {viewYear}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">เดือนก่อนหน้า</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewYear(today.getFullYear())
                  setViewMonth(today.getMonth())
                }}
              >
                วันนี้
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">เดือนถัดไป</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border bg-border">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {cells.map((date, i) => {
                if (!date) {
                  return <div key={i} className="min-h-20 bg-background/60" />
                }
                const key = dateKey(date)
                const dayExams = examsByDay.get(key) ?? []
                const isToday = date.getTime() === today.getTime()
                const isPast = date < today
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openAddFor(date)}
                    className={cn(
                      "flex min-h-20 flex-col items-start gap-1 bg-background p-1.5 text-left transition-colors hover:bg-accent/40",
                      isPast && "bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs",
                        isToday
                          ? "bg-primary font-semibold text-primary-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {dayExams.map((exam) => (
                      <span
                        key={exam.milestone.id}
                        className={cn(
                          "w-full truncate rounded-sm px-1.5 py-0.5 text-xs font-medium",
                          isPast
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                        title={`${exam.courseCode} — ${exam.milestone.title}`}
                      >
                        {exam.courseCode}
                      </span>
                    ))}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              เคล็ดลับ: คลิกวันใดก็ได้เพื่อเพิ่มวันสอบในวันนั้น
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardDescription>สอบที่กำลังจะมาถึง</CardDescription>
              <CardTitle className="text-3xl">{upcoming.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : upcoming.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CalendarDays className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    ไม่มีสอบที่กำลังจะมาถึง เพิ่มวันสอบเพื่อไม่ให้พลาด
                  </p>
                </div>
              ) : (
                upcoming.map((exam) => {
                  const days = daysUntil(exam.milestone.target_date.toDate())
                  return (
                    <Link
                      key={`${exam.courseId}-${exam.milestone.id}`}
                      to={`/courses/${exam.courseId}`}
                      className="flex items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:border-primary/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {exam.courseCode} · {exam.milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exam.milestone.target_date
                            .toDate()
                            .toLocaleDateString("th-TH", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </p>
                      </div>
                      <Badge
                        variant={days <= 7 ? "destructive" : "secondary"}
                        className="shrink-0"
                      >
                        {countdownLabel(days)}
                      </Badge>
                    </Link>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddExamDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        courses={courses}
        defaultDate={addDate}
      />
    </div>
  )
}
