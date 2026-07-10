import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { listenToCourses, listenToMilestones } from "@/lib/courses"
import type { Course, Milestone } from "@/types"

export function useCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToCourses(user.uid, (data) => {
      setCourses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  return { courses, loading }
}

export function useMilestones(courseId: string | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return
    const unsubscribe = listenToMilestones(courseId, (data) => {
      setMilestones(data)
      setLoading(false)
    })
    return unsubscribe
  }, [courseId])

  return { milestones, loading }
}
