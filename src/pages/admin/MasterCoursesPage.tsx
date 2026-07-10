import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  IoLibraryOutline as Library,
  IoPencilOutline as Pencil,
  IoAddOutline as Plus,
  IoLeafOutline as Sprout,
  IoTrashOutline as Trash2,
} from "react-icons/io5"
import { toast } from "sonner"
import {
  addMasterCourse,
  deleteMasterCourse,
  listenToMasterCourses,
  seedMasterCourses,
  updateMasterCourse,
} from "@/lib/admin"
import type { MasterCourse } from "@/types"
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
import { Badge } from "@/components/ui/badge"
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

/** Science/Math categories only — Art categories are intentionally excluded. */
const CATEGORIES = [
  "Science",
  "Mathematics",
  "Statistics",
  "Computer Science",
  "General Education",
] as const

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  Science: "วิทยาศาสตร์",
  Mathematics: "คณิตศาสตร์",
  Statistics: "สถิติ",
  "Computer Science": "วิทยาการคอมพิวเตอร์",
  "General Education": "ศึกษาทั่วไป",
}

const masterCourseSchema = z.object({
  course_code: z
    .string()
    .min(2, "กรุณากรอกรหัสวิชา")
    .max(12)
    .transform((s) => s.toUpperCase().trim()),
  name: z.string().min(1, "กรุณากรอกชื่อวิชา"),
  credits: z
    .number()
    .int()
    .min(1, "อย่างน้อย 1 หน่วยกิต")
    .max(12, "ไม่เกิน 12 หน่วยกิต"),
  category: z.enum(CATEGORIES),
})

type MasterCourseFormValues = z.infer<typeof masterCourseSchema>

export default function MasterCoursesPage() {
  const [courses, setCourses] = useState<MasterCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MasterCourse | null>(null)
  const [deleting, setDeleting] = useState<MasterCourse | null>(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const unsubscribe = listenToMasterCourses((data) => {
      setCourses(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const form = useForm<MasterCourseFormValues>({
    resolver: zodResolver(masterCourseSchema),
    defaultValues: {
      course_code: "",
      name: "",
      credits: 3,
      category: "Science",
    },
  })

  const filtered = search
    ? courses.filter(
        (c) =>
          c.course_code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : courses

  function openForm(course: MasterCourse | null) {
    setEditing(course)
    form.reset({
      course_code: course?.course_code ?? "",
      name: course?.name ?? "",
      credits: course?.credits ?? 3,
      category:
        (course?.category as (typeof CATEGORIES)[number]) ?? "Science",
    })
    setFormOpen(true)
  }

  async function onSubmit(values: MasterCourseFormValues) {
    try {
      if (editing?.id) {
        await updateMasterCourse(editing.id, values)
        toast.success("อัปเดตรายวิชาแล้ว")
      } else {
        await addMasterCourse(values)
        toast.success("เพิ่มรายวิชาแล้ว")
      }
      setFormOpen(false)
    } catch {
      toast.error("บันทึกไม่สำเร็จ ตรวจสอบว่าคุณมีสิทธิ์ผู้ดูแลระบบ")
    }
  }

  async function confirmDelete() {
    if (!deleting?.id) return
    try {
      await deleteMasterCourse(deleting.id)
      toast.success(`ลบ ${deleting.course_code} แล้ว`)
    } catch {
      toast.error("ลบไม่สำเร็จ")
    } finally {
      setDeleting(null)
    }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const n = await seedMasterCourses()
      toast.success(`เพิ่มตัวอย่างรายวิชา ${n} วิชาแล้ว`)
    } catch {
      toast.error("เพิ่มข้อมูลตัวอย่างไม่สำเร็จ")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">
          คลังรายวิชาอย่างเป็นทางการของมหาวิทยาลัยที่นักศึกษาทุกคนใช้ได้
        </p>
        <Button onClick={() => openForm(null)}>
          <Plus className="size-4" /> เพิ่มรายวิชา
        </Button>
      </div>

      <Input
        placeholder="ค้นหาด้วยรหัสหรือชื่อวิชา..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Library className="size-6" />
            </div>
            <p className="font-medium">คลังรายวิชาว่างเปล่า</p>
            <p className="text-sm text-muted-foreground">
              เพิ่มรายวิชาด้วยตนเองหรือเพิ่มข้อมูลตัวอย่างวิทยาศาสตร์/คณิตศาสตร์
            </p>
            <Button
              variant="outline"
              className="mt-1"
              onClick={handleSeed}
              disabled={seeding}
            >
              <Sprout className="size-4" />
              {seeding ? "กำลังเพิ่มข้อมูล..." : "เพิ่มข้อมูลตัวอย่าง"}
            </Button>
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
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">หน่วยกิต</TableHead>
                    <TableHead className="w-24 pr-6 text-right">
                      การจัดการ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        ไม่พบรายวิชาที่ตรงกับ "{search}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 font-medium">
                          {c.course_code}
                        </TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CATEGORY_LABELS[
                              c.category as (typeof CATEGORIES)[number]
                            ] ?? c.category}
                          </Badge>
                        </TableCell>
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
                    ))
                  )}
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
              {editing ? "แก้ไขรายวิชาในคลัง" : "เพิ่มรายวิชาในคลัง"}
            </DialogTitle>
            <DialogDescription>
              รายวิชานี้จะปรากฏในคลังรายวิชากลาง
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
                        <Input placeholder="PHY1001" {...field} />
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
                      <Input placeholder="ฟิสิกส์ 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมวดหมู่</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              "{deleting?.name}" จะถูกลบออกจากคลังรายวิชากลาง
              และไม่สามารถย้อนกลับได้
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
    </div>
  )
}
