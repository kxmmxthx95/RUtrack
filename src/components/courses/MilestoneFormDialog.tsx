import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { addMilestone, updateMilestone } from "@/lib/courses"
import type { Milestone } from "@/types"
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

export const MILESTONE_TYPES = [
  { value: "reading", label: "อ่านหนังสือ" },
  { value: "assignment", label: "งานที่มอบหมาย" },
  { value: "review", label: "ทบทวน" },
  { value: "exam", label: "สอบ" },
  { value: "other", label: "อื่น ๆ" },
] as const

const milestoneSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเป้าหมาย"),
  milestone_type: z.enum(["reading", "assignment", "review", "exam", "other"]),
  target_date: z.string().min(1, "กรุณาระบุวันที่เป้าหมาย"),
})

type MilestoneFormValues = z.infer<typeof milestoneSchema>

function toDateInputValue(ts: Timestamp): string {
  const d = ts.toDate()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface MilestoneFormDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  milestone?: Milestone | null
}

export function MilestoneFormDialog({
  courseId,
  open,
  onOpenChange,
  milestone,
}: MilestoneFormDialogProps) {
  const isEdit = Boolean(milestone?.id)

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: { title: "", milestone_type: "reading", target_date: "" },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        title: milestone?.title ?? "",
        milestone_type: milestone?.milestone_type ?? "reading",
        target_date: milestone?.target_date
          ? toDateInputValue(milestone.target_date)
          : "",
      })
    }
  }, [open, milestone, form])

  async function onSubmit(values: MilestoneFormValues) {
    const data = {
      title: values.title,
      milestone_type: values.milestone_type,
      target_date: Timestamp.fromDate(new Date(`${values.target_date}T00:00:00`)),
    }
    try {
      if (isEdit && milestone?.id) {
        await updateMilestone(courseId, milestone.id, data)
        toast.success("อัปเดตเป้าหมายแล้ว")
      } else {
        await addMilestone(courseId, { ...data, is_completed: false })
        toast.success("เพิ่มเป้าหมายแล้ว")
      }
      onOpenChange(false)
    } catch {
      toast.error("บันทึกเป้าหมายไม่สำเร็จ")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "แก้ไขเป้าหมาย" : "เพิ่มเป้าหมาย"}
          </DialogTitle>
          <DialogDescription>
            แบ่งรายวิชาออกเป็นเป้าหมายการเรียนที่ชัดเจน เช่น "อ่านบทที่ 1-3"
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อเป้าหมาย</FormLabel>
                  <FormControl>
                    <Input placeholder="อ่านบทที่ 1-3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="milestone_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ประเภท</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MILESTONE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่เป้าหมาย</FormLabel>
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
                {form.formState.isSubmitting
                  ? "กำลังบันทึก..."
                  : isEdit
                    ? "บันทึกการเปลี่ยนแปลง"
                    : "เพิ่มเป้าหมาย"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
