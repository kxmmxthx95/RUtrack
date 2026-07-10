import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { addCourse, updateCourse } from "@/lib/courses"
import type { Course, CourseStatus, Grade } from "@/types"
import { Button } from "@/components/ui/button"
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

const GRADES: Grade[] = ["A", "B+", "B", "C+", "C", "D+", "D", "F"]
const NO_GRADE = "none"

const courseSchema = z.object({
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
  status: z.enum(["enrolled", "passed", "failed"]),
  grade: z.enum(["A", "B+", "B", "C+", "C", "D+", "D", "F", NO_GRADE]),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass an existing course to edit; omit to create. */
  course?: Course | null
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
}: CourseFormDialogProps) {
  const { user } = useAuth()
  const isEdit = Boolean(course?.id)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_code: "",
      name: "",
      credits: 3,
      status: "enrolled",
      grade: NO_GRADE,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        course_code: course?.course_code ?? "",
        name: course?.name ?? "",
        credits: course?.credits ?? 3,
        status: course?.status ?? "enrolled",
        grade: course?.grade ?? NO_GRADE,
      })
    }
  }, [open, course, form])

  async function onSubmit(values: CourseFormValues) {
    if (!user) return
    const data = {
      course_code: values.course_code,
      name: values.name,
      credits: values.credits,
      status: values.status as CourseStatus,
      ...(values.grade !== NO_GRADE ? { grade: values.grade as Grade } : {}),
    }
    try {
      if (isEdit && course?.id) {
        await updateCourse(course.id, data)
        toast.success("อัปเดตรายวิชาแล้ว")
      } else {
        await addCourse({ ...data, userId: user.uid })
        toast.success("เพิ่มรายวิชาแล้ว")
      }
      onOpenChange(false)
    } catch {
      toast.error("บันทึกรายวิชาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขรายวิชา" : "เพิ่มรายวิชา"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "อัปเดตรายละเอียดของรายวิชานี้"
              : "เพิ่มรายวิชาที่คุณกำลังเรียนหรือเคยเรียนแล้ว"}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สถานะ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="enrolled">กำลังเรียน</SelectItem>
                        <SelectItem value="passed">ผ่านแล้ว</SelectItem>
                        <SelectItem value="failed">ไม่ผ่าน</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เกรด</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_GRADE}>ยังไม่มีเกรด</SelectItem>
                        {GRADES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
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
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "กำลังบันทึก..."
                  : isEdit
                    ? "บันทึกการเปลี่ยนแปลง"
                    : "เพิ่มรายวิชา"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
