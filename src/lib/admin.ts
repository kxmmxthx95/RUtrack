import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MasterCourse, UserProfile } from "@/types"

const masterCoursesCol = collection(db, "master_courses")
const usersCol = collection(db, "users")

export function listenToMasterCourses(
  onChange: (courses: MasterCourse[]) => void,
): () => void {
  const q = query(masterCoursesCol, orderBy("course_code", "asc"))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MasterCourse))
  })
}

export async function addMasterCourse(
  course: Omit<MasterCourse, "id">,
): Promise<string> {
  const ref = await addDoc(masterCoursesCol, course)
  return ref.id
}

export async function updateMasterCourse(
  id: string,
  data: Partial<Omit<MasterCourse, "id">>,
): Promise<void> {
  await updateDoc(doc(db, "master_courses", id), data)
}

export async function deleteMasterCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, "master_courses", id))
}

export async function countUsers(): Promise<number> {
  const snap = await getCountFromServer(usersCol)
  return snap.data().count
}

export async function countMasterCourses(): Promise<number> {
  const snap = await getCountFromServer(masterCoursesCol)
  return snap.data().count
}

export interface AdminUserRow extends UserProfile {
  id: string
}

export async function listUsers(): Promise<AdminUserRow[]> {
  const snap = await getDocs(usersCol)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }))
}

/**
 * Sample catalog used to seed an empty master_courses collection.
 * Science/Math subjects only — Art subjects are intentionally excluded.
 */
export const SAMPLE_MASTER_COURSES: Omit<MasterCourse, "id">[] = [
  { course_code: "MTH1101", name: "แคลคูลัส 1", credits: 3, category: "Mathematics" },
  { course_code: "MTH2102", name: "พีชคณิตเชิงเส้น", credits: 3, category: "Mathematics" },
  { course_code: "PHY1001", name: "ฟิสิกส์ 1", credits: 3, category: "Science" },
  { course_code: "PHY1002", name: "ฟิสิกส์ 2", credits: 3, category: "Science" },
  { course_code: "CHE1001", name: "เคมีทั่วไป", credits: 3, category: "Science" },
  { course_code: "BIO1001", name: "ชีววิทยาทั่วไป", credits: 3, category: "Science" },
  { course_code: "STA2003", name: "สถิติเบื้องต้น", credits: 3, category: "Statistics" },
  { course_code: "CSC1001", name: "วิทยาการคอมพิวเตอร์เบื้องต้น", credits: 3, category: "Computer Science" },
]

export async function seedMasterCourses(): Promise<number> {
  await Promise.all(SAMPLE_MASTER_COURSES.map((c) => addDoc(masterCoursesCol, c)))
  return SAMPLE_MASTER_COURSES.length
}
