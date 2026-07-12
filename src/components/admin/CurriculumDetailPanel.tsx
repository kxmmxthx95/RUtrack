import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  IoCloudUploadOutline as Upload,
  IoDownloadOutline as Download,
  IoLibraryOutline as Library,
  IoPencilOutline as Pencil,
  IoAddOutline as Plus,
  IoTrashOutline as Trash2,
} from "react-icons/io5"
import { toast } from "sonner"
import {
  addCurriculumCourse,
  bulkAddCurriculumCourses,
  deleteCurriculumCourse,
  generateCurriculumCsvTemplate,
  listenToCurriculumCourses,
  parseCurriculumCsv,
  updateCurriculumCourse,
  type CsvImportRow,
  type CsvRowError,
  type CurriculumNodeKey,
} from "@/lib/curriculum"
import { getCategoryLabel, SUBCATEGORIES } from "@/lib/courseCategories"
import { CAMPUS_LABELS } from "@/lib/universityCatalog"
import type { CurriculumCourse } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const courseSchema = z.object({
  course_code: z
    .string()
    .min(2, "กรุณากรอกรหัสวิชา")
    .max(12)
    .transform((s) => s.toUpperCase().trim()),
  name: z.string().min(1, "กรุณากรอกชื่อวิชา"),
  name_en: z.string().optional(),
  credits: z
    .number()
    .int()
    .min(1, "อย่างน้อย 1 หน่วยกิต")
    .max(12, "ไม่เกิน 12 หน่วยกิต"),
  course_category: z.enum([
    "general",
    "specialized_required",
    "specialized_core",
    "specialized_major",
    "specialized_minor",
    "specialized_elective_major",
    "specialized_elective_minor",
    "specialized_elective",
    "specialized_faculty_elective",
    "free_elective",
  ] as const),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CurriculumDetailPanelProps {
  node: CurriculumNodeKey | null
  onBack?: () => void
}

export function CurriculumDetailPanel({
  node,
  onBack,
}: CurriculumDetailPanelProps) {
  const [courses, setCourses] = useState<CurriculumCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CurriculumCourse | null>(null)
  const [deleting, setDeleting] = useState<CurriculumCourse | null>(null)

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(
    "general",
  )
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState<CsvImportRow[]>([])
  const [importErrors, setImportErrors] = useState<CsvRowError[]>([])
  const [importFileName, setImportFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!node) return
    setLoading(true)
    const unsubscribe = listenToCurriculumCourses(node, (data) => {
      setCourses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [node])

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_code: "",
      name: "",
      name_en: "",
      credits: 3,
      course_category: "general",
    },
  })

  function openForm(course: CurriculumCourse | null) {
    setEditing(course)
    const category = course?.course_category ?? "general"
    const mainCat = category.startsWith("specialized")
      ? "specialized"
      : category === "free_elective"
        ? "free_elective"
        : "general"
    setSelectedMainCategory(mainCat)
    form.reset({
      course_code: course?.course_code ?? "",
      name: course?.name ?? "",
      name_en: course?.name_en ?? "",
      credits: course?.credits ?? 3,
      course_category: category,
    })
    setFormOpen(true)
  }

  async function onSubmit(values: CourseFormValues) {
    if (!node) return
    try {
      if (editing?.id) {
        await updateCurriculumCourse(node, editing.id, values)
        toast.success("อัปเดตรายวิชาแล้ว")
      } else {
        await addCurriculumCourse(node, {
          course_code: values.course_code,
          name: values.name,
          name_en: values.name_en || undefined,
          credits: values.credits,
          course_category: values.course_category,
        })
        toast.success("เพิ่มรายวิชาแล้ว")
      }
      setFormOpen(false)
    } catch {
      toast.error("บันทึกไม่สำเร็จ ตรวจสอบว่าคุณมีสิทธิ์ผู้ดูแลระบบ")
    }
  }

  async function confirmDelete() {
    if (!deleting?.id || !node) return
    try {
      await deleteCurriculumCourse(node, deleting.id)
      toast.success(`ลบ ${deleting.course_code} แล้ว`)
    } catch {
      toast.error("ลบไม่สำเร็จ")
    } finally {
      setDeleting(null)
    }
  }

  function openImport() {
    setImportRows([])
    setImportErrors([])
    setImportFileName("")
    setImportOpen(true)
  }

  function downloadCsvTemplate() {
    const blob = new Blob([generateCurriculumCsvTemplate()], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_รายวิชา.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setImportFileName(file.name)
    const text = await file.text()
    const { rows, errors } = parseCurriculumCsv(text)
    setImportRows(rows)
    setImportErrors(errors)
  }

  async function confirmImport() {
    if (!node || importRows.length === 0) return
    setImporting(true)
    try {
      await bulkAddCurriculumCourses(node, importRows)
      toast.success(`นำเข้า ${importRows.length} รายวิชาแล้ว`)
      setImportOpen(false)
    } catch {
      toast.error("นำเข้าไม่สำเร็จ ตรวจสอบว่าคุณมีสิทธิ์ผู้ดูแลระบบ")
    } finally {
      setImporting(false)
    }
  }

  if (!node) {
    return (
      <Card className="flex h-full min-h-80 items-center justify-center">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Library className="size-6" />
          </div>
          <p className="font-medium">เลือกสาขาทางด้านซ้าย</p>
          <p className="text-sm text-muted-foreground">
            เลือกวิทยาเขต ปีการศึกษา คณะ และสาขา เพื่อดูและเพิ่มรายวิชาในหลักสูตร
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-1 -ml-2 text-muted-foreground md:hidden"
              onClick={onBack}
            >
              &larr; กลับไปที่ต้นไม้
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            {CAMPUS_LABELS[node.campus]} &rsaquo; ปีการศึกษา {node.academicYear}{" "}
            &rsaquo; {node.faculty}
          </p>
          <h2 className="text-lg font-semibold">{node.major}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openImport}>
            <Upload className="size-4" /> นำเข้า CSV
          </Button>
          <Button onClick={() => openForm(null)}>
            <Plus className="size-4" /> เพิ่มรายวิชา
          </Button>
        </div>
      </div>


      {/* Credit Summary */}
      {!loading && courses.length > 0 && (() => {
        const totalCredits = courses.reduce((s, c) => s + (c.credits ?? 0), 0)

        // Group by main category key
        const groups: { key: string; label: string; color: string; subs: { label: string; credits: number }[] }[] = [
          {
            key: "general",
            label: "หมวดวิชาทั่วไป",
            color: "bg-blue-500",
            subs: SUBCATEGORIES.general
              .map((s) => ({
                label: s.label,
                credits: courses.filter((c) => c.course_category === s.value).reduce((n, c) => n + (c.credits ?? 0), 0),
              }))
              .filter((s) => s.credits > 0),
          },
          {
            key: "specialized",
            label: "วิชาเฉพาะ",
            color: "bg-violet-500",
            subs: SUBCATEGORIES.specialized
              .map((s) => ({
                label: s.label,
                credits: courses.filter((c) => c.course_category === s.value).reduce((n, c) => n + (c.credits ?? 0), 0),
              }))
              .filter((s) => s.credits > 0),
          },
          {
            key: "free_elective",
            label: "หมวดวิชาเลือกเสรี",
            color: "bg-emerald-500",
            subs: SUBCATEGORIES.free_elective
              .map((s) => ({
                label: s.label,
                credits: courses.filter((c) => c.course_category === s.value).reduce((n, c) => n + (c.credits ?? 0), 0),
              }))
              .filter((s) => s.credits > 0),
          },
        ]

        return (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">สรุปหน่วยกิต</p>
              <span className="text-2xl font-bold tabular-nums">{totalCredits} <span className="text-sm font-normal text-muted-foreground">หน่วยกิต</span></span>
            </div>

            {/* Progress bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted gap-0.5">
              {groups.map((g) => {
                const gCredits = g.subs.reduce((n, s) => n + s.credits, 0)
                const pct = totalCredits > 0 ? (gCredits / totalCredits) * 100 : 0
                return pct > 0 ? (
                  <div
                    key={g.key}
                    className={`h-full rounded-full ${g.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                ) : null
              })}
            </div>

            {/* Per-group breakdown */}
            <div className="space-y-2 pt-1">
              {groups.map((g) => {
                const gCredits = g.subs.reduce((n, s) => n + s.credits, 0)
                if (gCredits === 0) return null
                return (
                  <div key={g.key}>
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className={`size-2.5 shrink-0 rounded-full ${g.color}`} />
                        <span className="font-medium">{g.label}</span>
                      </div>
                      <span className="font-semibold tabular-nums">{gCredits} หน่วยกิต</span>
                    </div>
                    {g.subs.map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-[12px] text-muted-foreground pl-4 mt-0.5">
                        <span>{s.label}</span>
                        <span className="tabular-nums">{s.credits}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-medium">ยังไม่มีรายวิชาในสาขานี้</p>
            <p className="text-sm text-muted-foreground">
              กด "เพิ่มรายวิชา" เพื่อเริ่มสร้างหลักสูตร
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">รหัสวิชา</TableHead>
                    <TableHead>ชื่อวิชา</TableHead>
                    <TableHead>หมวดวิชา</TableHead>
                    <TableHead className="text-right">หน่วยกิต</TableHead>
                    <TableHead className="w-24 pr-6 text-right">
                      การจัดการ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="pl-6 font-medium">
                        {c.course_code}
                      </TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{getCategoryLabel(c.course_category)}</TableCell>
                      <TableCell className="text-right">
                        {c.credits}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openForm(c)}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">แก้ไข</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(c)}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">ลบ</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "แก้ไขรายวิชา" : "เพิ่มรายวิชา"}
            </DialogTitle>
            <DialogDescription>
              ปีการศึกษา {node.academicYear} &rsaquo; {node.faculty} &rsaquo;{" "}
              {node.major}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="course_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รหัสวิชา</FormLabel>
                      <FormControl>
                        <Input placeholder="CSC1001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หน่วยกิต</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อวิชา</FormLabel>
                    <FormControl>
                      <Input placeholder="วิทยาการคอมพิวเตอร์เบื้องต้น" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อวิชาภาษาอังกฤษ</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">หมวดวิชาหลัก</label>
                  <Select
                    value={selectedMainCategory}
                    onValueChange={(value) => {
                      setSelectedMainCategory(value)
                      const subcats = SUBCATEGORIES[value]
                      if (subcats && subcats.length > 0) {
                        form.setValue("course_category", subcats[0].value)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">หมวดวิชาทั่วไป</SelectItem>
                      <SelectItem value="specialized">หมวดวิชาเฉพาะ</SelectItem>
                      <SelectItem value="free_elective">
                        หมวดวิชาเลือกเสรี
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="course_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedMainCategory === "general"
                          ? "ประเภท"
                          : selectedMainCategory === "specialized"
                            ? "ประเภทวิชา"
                            : "ประเภท"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBCATEGORIES[selectedMainCategory]?.map(
                            (subcat) => (
                              <SelectItem key={subcat.value} value={subcat.value}>
                                {subcat.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "กำลังบันทึก..."
                    : editing
                      ? "บันทึกการเปลี่ยนแปลง"
                      : "เพิ่มรายวิชา"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ {deleting?.course_code}?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" จะถูกลบออกจากหลักสูตรนี้และไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>นำเข้ารายวิชาจาก CSV</DialogTitle>
            <DialogDescription>
              ปีการศึกษา {node.academicYear} &rsaquo; {node.faculty} &rsaquo;{" "}
              {node.major}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-muted px-4 py-3 text-sm space-y-2">
              <p className="font-medium">รูปแบบไฟล์ CSV</p>
              <p className="text-muted-foreground">
                คอลัมน์ (แถวแรกเป็นหัวตาราง):{" "}
                <code className="rounded bg-background px-1 py-0.5">
                  course_code, name, name_en, credits, course_category
                </code>
              </p>
              <p className="text-muted-foreground">
                ช่อง course_category ใส่ค่าใดค่าหนึ่งต่อไปนี้ (พิมพ์ชื่อไทยหรือรหัสก็ได้):
              </p>
              <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-muted-foreground sm:grid-cols-2">
                {Object.values(SUBCATEGORIES)
                  .flat()
                  .map((c) => (
                    <li key={c.value}>
                      <code className="rounded bg-background px-1 py-0.5">
                        {c.value}
                      </code>{" "}
                      = {c.label}
                    </li>
                  ))}
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadCsvTemplate}
              >
                <Download className="size-4" /> ดาวน์โหลด Template
              </Button>
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" /> เลือกไฟล์ CSV
              </Button>
              {importFileName && (
                <p className="text-sm text-muted-foreground">
                  ไฟล์: {importFileName}
                </p>
              )}
            </div>

            {importErrors.length > 0 && (
              <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm">
                <p className="font-medium text-destructive mb-1">
                  พบข้อผิดพลาด {importErrors.length} แถว (แถวเหล่านี้จะไม่ถูกนำเข้า)
                </p>
                <ul className="max-h-32 overflow-y-auto text-destructive/90 space-y-0.5">
                  {importErrors.map((err) => (
                    <li key={err.line}>
                      บรรทัด {err.line}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importRows.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  พร้อมนำเข้า {importRows.length} รายวิชา
                </p>
                <div className="max-h-64 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">รหัสวิชา</TableHead>
                        <TableHead>ชื่อวิชา</TableHead>
                        <TableHead>หมวดวิชา</TableHead>
                        <TableHead className="pr-4 text-right">
                          หน่วยกิต
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="pl-4 font-medium">
                            {row.course_code}
                          </TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            {getCategoryLabel(row.course_category)}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            {row.credits}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={confirmImport}
              disabled={importRows.length === 0 || importing}
            >
              {importing
                ? "กำลังนำเข้า..."
                : `นำเข้า ${importRows.length || ""} รายวิชา`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
