import type { CourseCategoryType } from "@/types"

export const SUBCATEGORIES: Record<
  string,
  { value: CourseCategoryType; label: string }[]
> = {
  general: [{ value: "general", label: "หมวดวิชาทั่วไป" }],
  specialized: [
    { value: "specialized_required", label: "วิชาบังคับ" },
    { value: "specialized_core", label: "วิชาแกน" },
    { value: "specialized_major", label: "วิชาเอก" },
    { value: "specialized_minor", label: "วิชาโท" },
    { value: "specialized_elective_major", label: "วิชาเอกเลือก" },
    { value: "specialized_elective_minor", label: "วิชาโทเลือก" },
    { value: "specialized_elective", label: "วิชาเลือก" },
    { value: "specialized_faculty_elective", label: "วิชาเลือกในคณะ" },
  ],
  free_elective: [{ value: "free_elective", label: "หมวดวิชาเลือกเสรี" }],
}

export const ALL_CATEGORIES = Object.values(SUBCATEGORIES).flat()

export function getCategoryLabel(category: CourseCategoryType): string {
  return ALL_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/** Matches a CSV cell against either the internal value (e.g. "specialized_major") or the Thai label (e.g. "วิชาเอก"). */
export function findCategoryByValueOrLabel(
  input: string,
): CourseCategoryType | null {
  const trimmed = input.trim()
  const byValue = ALL_CATEGORIES.find((c) => c.value === trimmed)
  if (byValue) return byValue.value
  const byLabel = ALL_CATEGORIES.find((c) => c.label === trimmed)
  if (byLabel) return byLabel.value
  return null
}
