import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { addMilestone } from "@/lib/courses"
import type { Course } from "@/types"
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

const examSchema = z.object({
  courseId: z.string().min(1, "กรุณาเลือกรายวิชา"),
  title: z.string().min(1, "กรุณากรอกชื่อ"),
  target_date: z.string().min(1, "กรุณาระบุวันสอบ"),
})

type ExamFormValues = z.infer<typeof examSchema>

interface AddExamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  /** Preselected date (from clicking a calendar day), yyyy-mm-dd. */
  defaultDate?: string
}

export function AddExamDialog({
  open,
  onOpenChange,
  courses,
  defaultDate,
}: AddExamDialogProps) {
  const { user } = useAuth()
  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { courseId: "", title: "สอบปลายภาค", target_date: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        courseId: courses.length === 1 ? (courses[0].id ?? "") : "",
        title: "สอบปลายภาค",
        target_date: defaultDate ?? "",
      })
    }
  }, [open, defaultDate, courses, form])

  async function onSubmit(values: ExamFormValues) {
    if (!user) return
    try {
      await addMilestone(user.uid, values.courseId, {
        title: values.title,
        milestone_type: "exam",
        target_date: Timestamp.fromDate(
          new Date(`${values.target_date}T00:00:00`),
        ),
        is_completed: false,
      })
      toast.success("เพิ่มวันสอบลงปฏิทินแล้ว")
      onOpenChange(false)
    } catch {
      toast.error("เพิ่มวันสอบไม่สำเร็จ")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มวันสอบ</DialogTitle>
          <DialogDescription>
            วันสอบจะถูกบันทึกเป็นเป้าหมายประเภท "สอบ" ของรายวิชาที่เลือก
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายวิชา</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกรายวิชา" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id ?? ""}>
                          {c.course_code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input placeholder="สอบปลายภาค" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันสอบ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                {form.formState.isSubmitting ? "กำลังบันทึก..." : "เพิ่มวันสอบ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
