import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { listenToMilestones } from "@/lib/courses"
import type { Course, Milestone } from "@/types"

export interface ExamEntry {
  courseId: string
  courseCode: string
  courseName: string
  milestone: Milestone
}

/**
 * Aggregates milestones of type "exam" across all of the user's courses.
 * Milestones live in per-course subcollections, so we subscribe per course
 * (fine for a typical 7-subject load).
 */
export function useExams(courses: Course[]) {
  const { user } = useAuth()
  const [examsByCourse, setExamsByCourse] = useState<
    Record<string, ExamEntry[]>
  >({})

  const courseIds = courses
    .map((c) => c.id)
    .filter(Boolean)
    .join(",")

  useEffect(() => {
    if (!user) return
    setExamsByCourse({})
    const unsubscribers = courses
      .filter((c): c is Course & { id: string } => Boolean(c.id))
      .map((course) =>
        listenToMilestones(user.uid, course.id, (milestones) => {
          const exams = milestones
            .filter((m) => m.milestone_type === "exam")
            .map((m) => ({
              courseId: course.id,
              courseCode: course.course_code,
              courseName: course.name,
              milestone: m,
            }))
          setExamsByCourse((prev) => ({ ...prev, [course.id]: exams }))
        }),
      )
    return () => unsubscribers.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIds, user])

  return useMemo(() => {
    const all = Object.values(examsByCourse).flat()
    all.sort(
      (a, b) =>
        a.milestone.target_date.toMillis() - b.milestone.target_date.toMillis(),
    )
    return all
  }, [examsByCourse])
}
