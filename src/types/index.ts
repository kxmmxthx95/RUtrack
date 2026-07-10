import type { Timestamp } from "firebase/firestore"

export type CampusType = "main" | "bangna" | "regional" | "online"

export type CourseStatus = "enrolled" | "passed" | "failed"

export type Grade = "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "F"

export const GRADE_POINTS: Record<Grade, number> = {
  A: 4.0,
  "B+": 3.5,
  B: 3.0,
  "C+": 2.5,
  C: 2.0,
  "D+": 1.5,
  D: 1.0,
  F: 0,
}

/** users/{uid} */
export interface UserProfile {
  academic_year: number
  campus_type: CampusType
  faculty: string
  major: string
  student_id: string // 10 digits
  title?: string
  first_name?: string
  last_name?: string
  phone_number?: string
  additional_info: {
    commute_distance_km?: number
    commute_minutes_per_day?: number
    work_hours_per_week?: number
    [key: string]: unknown
  }
  is_admin?: boolean
}

/** courses/{courseId} */
export interface Course {
  id?: string
  userId: string
  course_code: string
  name: string
  credits: number
  status: CourseStatus
  grade?: Grade
}

/** courses/{courseId}/milestones/{milestoneId} */
export interface Milestone {
  id?: string
  title: string
  milestone_type: "reading" | "assignment" | "review" | "exam" | "other"
  target_date: Timestamp
  is_completed: boolean
}

/** study_events/{eventId} */
export interface StudyEvent {
  id?: string
  userId: string
  title: string
  start_time: Timestamp
  end_time: Timestamp
  is_fixed_cost: boolean // commute, work, etc.
}

/** master_courses/{courseId} — global catalog managed by admins */
export interface MasterCourse {
  id?: string
  course_code: string
  name: string
  credits: number
  category: string
}
