import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { CourseCategoryType, CurriculumCourse } from "@/types"
import type { CampusCatalogKey } from "@/lib/universityCatalog"
import { findCategoryByValueOrLabel } from "@/lib/courseCategories"

/** Identifies one "สาขา" node in the campus > academic_year > faculty > major tree. */
export interface CurriculumNodeKey {
  campus: CampusCatalogKey
  academicYear: number
  faculty: string
  major: string
}

/** curricula/{campus}/years/{academicYear}/faculties/{faculty}/majors/{major}/courses */
function coursesCol(node: CurriculumNodeKey) {
  return collection(
    db,
    "curricula",
    node.campus,
    "years",
    String(node.academicYear),
    "faculties",
    node.faculty,
    "majors",
    node.major,
    "courses",
  )
}

/**
 * Extract academic year (Buddhist year, e.g. 2566) from a 10-digit student ID.
 * First 2 digits = 2-digit year; convert to full Buddhist year (60 → 2560, 66 → 2566).
 */
export function extractAcademicYearFromStudentId(studentId: string): number | null {
  const clean = studentId.replace(/\D/g, "")
  if (clean.length !== 10) return null
  const twoDigitYear = parseInt(clean.slice(0, 2), 10)
  return 2500 + twoDigitYear
}

export function listenToCurriculumCourses(
  node: CurriculumNodeKey,
  onChange: (courses: CurriculumCourse[]) => void,
): () => void {
  return onSnapshot(coursesCol(node), (snap) => {
    const courses = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CurriculumCourse,
    )
    courses.sort((a, b) => a.course_code.localeCompare(b.course_code))
    onChange(courses)
  })
}

export async function addCurriculumCourse(
  node: CurriculumNodeKey,
  course: Omit<CurriculumCourse, "id">,
): Promise<string> {
  const { name_en, ...rest } = course
  const ref = await addDoc(coursesCol(node), {
    ...rest,
    ...(name_en ? { name_en } : {}),
  })
  return ref.id
}

export async function updateCurriculumCourse(
  node: CurriculumNodeKey,
  id: string,
  data: Partial<Omit<CurriculumCourse, "id">>,
): Promise<void> {
  await updateDoc(doc(coursesCol(node), id), data)
}

export async function deleteCurriculumCourse(
  node: CurriculumNodeKey,
  id: string,
): Promise<void> {
  await deleteDoc(doc(coursesCol(node), id))
}

const CSV_HEADERS = ["course_code", "name", "name_en", "credits", "course_category"] as const

export interface CsvImportRow {
  course_code: string
  name: string
  name_en: string
  credits: number
  course_category: CourseCategoryType
}

export interface CsvRowError {
  line: number
  message: string
}

export function generateCurriculumCsvTemplate(): string {
  const header = CSV_HEADERS.join(",")
  const example = [
    "CSC1001",
    "วิทยาการคอมพิวเตอร์เบื้องต้น",
    "Introduction to Computer Science",
    "3",
    "specialized_major",
  ].join(",")
  return `${header}\n${example}\n`
}

/** Minimal RFC 4180 line splitter: handles quoted fields with embedded commas/quotes. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      cells.push(cur)
      cur = ""
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

export function parseCurriculumCsv(text: string): {
  rows: CsvImportRow[]
  errors: CsvRowError[]
} {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0)
  const rows: CsvImportRow[] = []
  const errors: CsvRowError[] = []
  if (lines.length === 0) return { rows, errors }

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const startIdx = header[0] === "course_code" ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const lineNo = i + 1
    const [course_code, name, name_en, creditsRaw, categoryRaw] = parseCsvLine(
      lines[i],
    )

    if (!course_code) {
      errors.push({ line: lineNo, message: "ไม่มีรหัสวิชา" })
      continue
    }
    if (!name) {
      errors.push({ line: lineNo, message: "ไม่มีชื่อวิชา" })
      continue
    }
    const credits = parseInt(creditsRaw, 10)
    if (!creditsRaw || Number.isNaN(credits) || credits < 1 || credits > 12) {
      errors.push({ line: lineNo, message: "หน่วยกิตไม่ถูกต้อง (ต้องเป็นตัวเลข 1-12)" })
      continue
    }
    const category = findCategoryByValueOrLabel(categoryRaw ?? "")
    if (!category) {
      errors.push({
        line: lineNo,
        message: `หมวดวิชาไม่ถูกต้อง: "${categoryRaw ?? ""}"`,
      })
      continue
    }

    rows.push({
      course_code: course_code.toUpperCase(),
      name,
      name_en: name_en ?? "",
      credits,
      course_category: category,
    })
  }

  return { rows, errors }
}

export async function bulkAddCurriculumCourses(
  node: CurriculumNodeKey,
  rows: CsvImportRow[],
): Promise<void> {
  const BATCH_SIZE = 400
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    for (const row of rows.slice(i, i + BATCH_SIZE)) {
      const ref = doc(coursesCol(node))
      batch.set(ref, {
        course_code: row.course_code,
        name: row.name,
        ...(row.name_en ? { name_en: row.name_en } : {}),
        credits: row.credits,
        course_category: row.course_category,
      })
    }
    await batch.commit()
  }
}
