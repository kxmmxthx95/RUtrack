import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Course, Milestone } from "@/types"

/** Total credits required to graduate (RU bachelor's degree). */
export const DEGREE_TOTAL_CREDITS = 139

function coursesCol(userId: string) {
  return collection(db, "users", userId, "courses")
}

export function listenToCourses(
  userId: string,
  onChange: (courses: Course[]) => void,
): () => void {
  return onSnapshot(coursesCol(userId), (snap) => {
    const courses = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Course,
    )
    courses.sort((a, b) => a.course_code.localeCompare(b.course_code))
    onChange(courses)
  })
}

export async function addCourse(
  userId: string,
  course: Omit<Course, "id">,
): Promise<string> {
  const ref = await addDoc(coursesCol(userId), course)
  return ref.id
}

export async function updateCourse(
  userId: string,
  courseId: string,
  data: Partial<Omit<Course, "id">>,
): Promise<void> {
  await updateDoc(doc(coursesCol(userId), courseId), data)
}

export async function deleteCourse(
  userId: string,
  courseId: string,
): Promise<void> {
  // Firestore doesn't cascade-delete subcollections, so clear milestones
  // first (while the parent still exists and rules can verify ownership).
  const milestones = await getDocs(milestonesCol(userId, courseId))
  const batch = writeBatch(db)
  milestones.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(coursesCol(userId), courseId))
  await batch.commit()
}

// --- Milestones (subcollection of users/{userId}/courses/{courseId}) ---

function milestonesCol(userId: string, courseId: string) {
  return collection(db, "users", userId, "courses", courseId, "milestones")
}

export function listenToMilestones(
  userId: string,
  courseId: string,
  onChange: (milestones: Milestone[]) => void,
): () => void {
  const q = query(milestonesCol(userId, courseId), orderBy("target_date", "asc"))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Milestone))
  })
}

export async function addMilestone(
  userId: string,
  courseId: string,
  milestone: Omit<Milestone, "id">,
): Promise<string> {
  const ref = await addDoc(milestonesCol(userId, courseId), milestone)
  return ref.id
}

export async function updateMilestone(
  userId: string,
  courseId: string,
  milestoneId: string,
  data: Partial<Omit<Milestone, "id">>,
): Promise<void> {
  await updateDoc(doc(milestonesCol(userId, courseId), milestoneId), data)
}

export async function deleteMilestone(
  userId: string,
  courseId: string,
  milestoneId: string,
): Promise<void> {
  await deleteDoc(doc(milestonesCol(userId, courseId), milestoneId))
}
