import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลระบบ</CardTitle>
          <CardDescription>ภาพรวมการตั้งค่า RU Track</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">โปรเจกต์ Firebase</span>
            <span className="font-medium">ru-track-planner</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ภูมิภาค Firestore</span>
            <span className="font-medium">asia-southeast1</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">หน่วยกิตที่ต้องใช้จบการศึกษา</span>
            <span className="font-medium">139 หน่วยกิต</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">สิทธิ์ผู้ดูแลระบบ</span>
            <span className="font-medium">
              users/&lt;uid&gt; · is_admin: true
            </span>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        สิทธิ์ผู้ดูแลระบบจะถูกมอบให้โดยการตั้งค่า <code>is_admin: true</code>{" "}
        บนเอกสารของผู้ใช้งานโดยตรงในคอนโซล Firebase
        ผู้ใช้งานไม่สามารถให้สิทธิ์ผู้ดูแลระบบแก่ตนเองได้ — ระบบนี้บังคับใช้โดย
        Firestore Security Rules
      </p>
    </div>
  )
}
