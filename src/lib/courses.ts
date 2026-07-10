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
  where,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Course, Milestone } from "@/types"

/** Total credits required to graduate (RU bachelor's degree). */
export const DEGREE_TOTAL_CREDITS = 139

const coursesCol = collection(db, "courses")

export function listenToCourses(
  userId: string,
  onChange: (courses: Course[]) => void,
): () => void {
  const q = query(coursesCol, where("userId", "==", userId))
  return onSnapshot(q, (snap) => {
    const courses = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Course,
    )
    courses.sort((a, b) => a.course_code.localeCompare(b.course_code))
    onChange(courses)
  })
}

export async function addCourse(course: Omit<Course, "id">): Promise<string> {
  const ref = await addDoc(coursesCol, course)
  return ref.id
}

export async function updateCourse(
  courseId: string,
  data: Partial<Omit<Course, "id" | "userId">>,
): Promise<void> {
  await updateDoc(doc(db, "courses", courseId), data)
}

export async function deleteCourse(courseId: string): Promise<void> {
  // Firestore doesn't cascade-delete subcollections, so clear milestones
  // first (while the parent still exists and rules can verify ownership).
  const milestones = await getDocs(collection(db, "courses", courseId, "milestones"))
  const batch = writeBatch(db)
  milestones.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(db, "courses", courseId))
  await batch.commit()
}

// --- Milestones (subcollection of courses/{courseId}) ---

function milestonesCol(courseId: string) {
  return collection(db, "courses", courseId, "milestones")
}

export function listenToMilestones(
  courseId: string,
  onChange: (milestones: Milestone[]) => void,
): () => void {
  const q = query(milestonesCol(courseId), orderBy("target_date", "asc"))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Milestone))
  })
}

export async function addMilestone(
  courseId: string,
  milestone: Omit<Milestone, "id">,
): Promise<string> {
  const ref = await addDoc(milestonesCol(courseId), milestone)
  return ref.id
}

export async function updateMilestone(
  courseId: string,
  milestoneId: string,
  data: Partial<Omit<Milestone, "id">>,
): Promise<void> {
  await updateDoc(doc(db, "courses", courseId, "milestones", milestoneId), data)
}

export async function deleteMilestone(
  courseId: string,
  milestoneId: string,
): Promise<void> {
  await deleteDoc(doc(db, "courses", courseId, "milestones", milestoneId))
}
