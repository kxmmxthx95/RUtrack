import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { saveUserProfile } from "@/lib/profile"
import type { CampusType, UserProfile } from "@/types"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const CAMPUS_OPTIONS: { value: CampusType; label: string; hint: string }[] = [
  { value: "main", label: "วิทยาเขตหลัก", hint: "หัวหมาก กรุงเทพฯ" },
  { value: "bangna", label: "วิทยาเขตบางนา", hint: "วิทยาเขต 2" },
  { value: "regional", label: "วิทยาเขตส่วนภูมิภาค", hint: "ศูนย์ต่างจังหวัด" },
  { value: "online", label: "ออนไลน์ / ทางไกล", hint: "เรียนทางไกล" },
]

const profileSchema = z.object({
  student_id: z
    .string()
    .regex(/^\d{10}$/, "รหัสนักศึกษาต้องมี 10 หลักพอดี"),
  academic_year: z.number().int().min(1).max(8),
  campus_type: z.enum(["main", "bangna", "regional", "online"]),
  faculty: z.string().min(1, "กรุณากรอกคณะ"),
  major: z.string().min(1, "กรุณากรอกสาขาวิชา"),
  commute_distance_km: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(1000, "ระยะทางไกลเกินไป"),
  commute_minutes_per_day: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(1440, "ต้องไม่เกิน 24 ชั่วโมง"),
  work_hours_per_week: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(168, "ต้องไม่เกิน 168 ชั่วโมง"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSetupPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      student_id: profile?.student_id ?? "",
      academic_year: profile?.academic_year ?? 4,
      campus_type: profile?.campus_type ?? "main",
      faculty: profile?.faculty ?? "",
      major: profile?.major ?? "",
      commute_distance_km:
        Number(profile?.additional_info?.commute_distance_km ?? 0),
      commute_minutes_per_day:
        Number(profile?.additional_info?.commute_minutes_per_day ?? 0),
      work_hours_per_week:
        Number(profile?.additional_info?.work_hours_per_week ?? 0),
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    const data: UserProfile = {
      student_id: values.student_id,
      academic_year: values.academic_year,
      campus_type: values.campus_type,
      faculty: values.faculty,
      major: values.major,
      additional_info: {
        commute_distance_km: values.commute_distance_km,
        commute_minutes_per_day: values.commute_minutes_per_day,
        work_hours_per_week: values.work_hours_per_week,
      },
    }
    try {
      await saveUserProfile(user.uid, data)
      await refreshProfile()
      toast.success("บันทึกโปรไฟล์แล้ว")
      navigate("/", { replace: true })
    } catch {
      toast.error("บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFC] px-4 py-12 dark:bg-[#0f172a]">
      <div className="w-full max-w-2xl rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#1e293b] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] sm:p-10">
        

        {/* Header */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          ข้อมูลนักศึกษา
        </h1>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* Student ID field */}
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">รหัสนักศึกษา</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="6612345678"
                          inputMode="numeric"
                          maxLength={10}
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">10 หลัก</FormDescription>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Academic Year field */}
                <FormField
                  control={form.control}
                  name="academic_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">ชั้นปี</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800">
                            <SelectValue placeholder="เลือกชั้นปี" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-md dark:border-slate-800 dark:bg-[#1e293b]">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                            <SelectItem key={y} value={String(y)} className="rounded-lg cursor-pointer">
                              ชั้นปีที่ {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Faculty field */}
                <FormField
                  control={form.control}
                  name="faculty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">คณะ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="เช่น วิทยาศาสตร์"
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Major field */}
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">สาขาวิชา</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="เช่น วิทยาการคอมพิวเตอร์"
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campus Type field */}
              <FormField
                control={form.control}
                name="campus_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">ประเภทวิทยาเขต</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-3 sm:grid-cols-2"
                      >
                        {CAMPUS_OPTIONS.map((opt) => (
                          <FormItem key={opt.value}>
                            <FormLabel className="flex cursor-pointer items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/30 p-4 font-normal transition-all hover:bg-slate-50/80 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50/10 dark:border-slate-800 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 dark:has-[[data-state=checked]]:border-blue-500 dark:has-[[data-state=checked]]:bg-blue-500/5">
                              <FormControl>
                                <RadioGroupItem value={opt.value} className="mt-0.5 cursor-pointer" />
                              </FormControl>
                              <span className="grid gap-0.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{opt.label}</span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {opt.hint}
                                </span>
                              </span>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500 mt-0.5" />
                  </FormItem>
                )}
              />


              {/* Submit Button */}
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#4A86F7] to-[#2B61E3] text-sm font-medium text-white shadow-md shadow-blue-500/10 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/15 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] sm:w-auto sm:px-8 sm:justify-self-end disabled:pointer-events-none disabled:opacity-50"
              >
                {form.formState.isSubmitting ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
              </button>
            </form>
          </Form>
        </div>

      </div>
    </div>
  )
}
