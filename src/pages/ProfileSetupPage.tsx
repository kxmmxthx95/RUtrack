import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { saveUserProfile } from "@/lib/profile"
import {
  getFaculties,
  getPrograms,
  getMajors,
  type CampusCatalogKey,
} from "@/lib/universityCatalog"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const CAMPUS_OPTIONS: { value: CampusType; label: string; hint: string }[] = [
  { value: "main", label: "วิทยาเขตหลัก", hint: "หัวหมาก กรุงเทพฯ" },
  { value: "bangna", label: "วิทยาเขตบางนา", hint: "วิทยาเขต 2" },
  { value: "regional", label: "วิทยาเขตส่วนภูมิภาค", hint: "ศูนย์ต่างจังหวัด" },
]

const TITLE_OPTIONS = ["นาย", "นางสาว", "นาง"]

const profileSchema = z.object({
  student_id: z
    .string()
    .regex(/^\d{10}$/, "รหัสนักศึกษาต้องมี 10 หลักพอดี"),
  academic_year: z.number().int().min(1).max(8).optional().default(1),
  campus_type: z.enum(["main", "bangna", "regional", "online"]),
  faculty: z.string().min(1, "กรุณากรอกคณะ"),
  program: z.string().min(1, "กรุณาเลือกหลักสูตร"),
  major: z.string().min(1, "กรุณากรอกสาขาวิชา"),
  title: z.string().min(1, "กรุณากรอกคำนำหน้า"),
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  phone_number: z
    .string()
    .min(1, "กรุณากรอกเบอร์โทรศัพท์")
    .regex(/^\d{9,10}$/, "เบอร์โทรศัพท์ต้องมี 9-10 หลัก"),
  commute_distance_km: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(1000, "ระยะทางไกลเกินไป")
    .optional()
    .default(0),
  commute_minutes_per_day: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(1440, "ต้องไม่เกิน 24 ชั่วโมง")
    .optional()
    .default(0),
  work_hours_per_week: z
    .number()
    .min(0, "ต้องเป็น 0 หรือมากกว่า")
    .max(168, "ต้องไม่เกิน 168 ชั่วโมง")
    .optional()
    .default(0),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSetupPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      student_id: profile?.student_id ?? "",
      academic_year: profile?.academic_year ?? 1,
      campus_type: profile?.campus_type ?? "main",
      faculty: profile?.faculty ?? "",
      program: profile?.program ?? "",
      major: profile?.major ?? "",
      title: profile?.title ?? "",
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      phone_number: profile?.phone_number ?? "",
      commute_distance_km:
        Number(profile?.additional_info?.commute_distance_km ?? 0),
      commute_minutes_per_day:
        Number(profile?.additional_info?.commute_minutes_per_day ?? 0),
      work_hours_per_week:
        Number(profile?.additional_info?.work_hours_per_week ?? 0),
    },
  })

  const campusType = form.watch("campus_type")
  const catalogCampus: CampusCatalogKey =
    campusType === "bangna" || campusType === "regional" ? campusType : "main"
  const faculties = useMemo(
    () => getFaculties(catalogCampus),
    [catalogCampus],
  )
  const selectedFaculty = form.watch("faculty")
  const selectedProgram = form.watch("program")
  const selectedMajor = form.watch("major")
  const programs = useMemo(
    () => getPrograms(catalogCampus, selectedFaculty),
    [catalogCampus, selectedFaculty],
  )
  const majors = useMemo(
    () => getMajors(catalogCampus, selectedFaculty, selectedProgram),
    [catalogCampus, selectedFaculty, selectedProgram],
  )

  useEffect(() => {
    if (selectedFaculty && !faculties.some((faculty) => faculty.name === selectedFaculty)) {
      form.setValue("faculty", "")
      form.setValue("program", "")
      form.setValue("major", "")
    }
  }, [faculties, form, selectedFaculty])

  useEffect(() => {
    if (selectedProgram && !programs.some((p) => p.name === selectedProgram)) {
      form.setValue("program", "")
      form.setValue("major", "")
    }
  }, [form, programs, selectedProgram])

  useEffect(() => {
    if (selectedMajor && !majors.some((major) => major.name === selectedMajor)) {
      form.setValue("major", "")
    }
  }, [form, majors, selectedMajor])

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return
    const data: UserProfile = {
      student_id: values.student_id,
      academic_year: values.academic_year ?? 1,
      campus_type: values.campus_type,
      faculty: values.faculty,
      program: values.program,
      major: values.major,
      title: values.title,
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      additional_info: {
        commute_distance_km: values.commute_distance_km ?? 0,
        commute_minutes_per_day: values.commute_minutes_per_day ?? 0,
        work_hours_per_week: values.work_hours_per_week ?? 0,
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

              {/* 3. ข้อมูลส่วนตัว (คำนำหน้า ชื่อ นามสกุล) */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                {/* Title field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">คำนำหน้า</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800">
                            <SelectValue placeholder="เลือกคำนำหน้า" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-md dark:border-slate-800 dark:bg-[#1e293b]">
                          {TITLE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t} className="rounded-lg cursor-pointer">
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* First Name field */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">ชื่อ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="สมชาย"
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Last Name field */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">นามสกุล</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ใจดี"
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />
              </div>

              {/* ข้อมูลการติดต่อและรหัสนักศึกษา */}
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
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Phone Number field */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">เบอร์โทรศัพท์</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="เช่น 0812345678"
                          inputMode="tel"
                          maxLength={10}
                          {...field}
                          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 1. วิทยาเขต (Campus Type) */}
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

              {/* 2. ข้อมูลวิชาการ */}
              <div className="grid gap-6 sm:grid-cols-3">
                {/* Faculty field */}
                <FormField
                  control={form.control}
                  name="faculty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">คณะ</FormLabel>
                      <Select onValueChange={(val) => { field.onChange(val); form.setValue("program", ""); form.setValue("major", "") }} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800">
                            <SelectValue placeholder="เลือกคณะ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-md dark:border-slate-800 dark:bg-[#1e293b]">
                          {faculties.map((faculty) => (
                            <SelectItem key={faculty.name} value={faculty.name} className="rounded-lg cursor-pointer">
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />

                {/* Program field */}
                <FormField
                  control={form.control}
                  name="program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">หลักสูตร</FormLabel>
                      <Select
                        onValueChange={(val) => { field.onChange(val); form.setValue("major", "") }}
                        value={field.value}
                        disabled={!selectedFaculty || programs.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800">
                            <SelectValue
                              placeholder={selectedFaculty ? "เลือกหลักสูตร" : "เลือกคณะก่อน"}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-md dark:border-slate-800 dark:bg-[#1e293b]">
                          {programs.map((program) => (
                            <SelectItem key={program.name} value={program.name} className="rounded-lg cursor-pointer">
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedProgram || majors.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800">
                            <SelectValue
                              placeholder={
                                selectedProgram ? "เลือกสาขาวิชา" : "เลือกหลักสูตรก่อน"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-md dark:border-slate-800 dark:bg-[#1e293b]">
                          {majors.map((major) => (
                            <SelectItem key={major.name} value={major.name} className="rounded-lg cursor-pointer">
                              {major.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-0.5" />
                    </FormItem>
                  )}
                />
              </div>

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
