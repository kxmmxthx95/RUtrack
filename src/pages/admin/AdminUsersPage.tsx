import { useEffect, useState } from "react"
import { toast } from "sonner"
import { listUsers, type AdminUserRow } from "@/lib/admin"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CAMPUS_LABELS: Record<string, string> = {
  main: "วิทยาเขตหลัก",
  bangna: "บางนา",
  regional: "ส่วนภูมิภาค",
  online: "ออนไลน์",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null)

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => {
        toast.error("โหลดข้อมูลผู้ใช้งานไม่สำเร็จ")
        setUsers([])
      })
  }, [])

  if (users === null) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        นักศึกษาที่ลงทะเบียนแล้ว {users.length} คน
      </p>
      <Card className="py-0">
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">รหัสนักศึกษา</TableHead>
                  <TableHead>คณะ</TableHead>
                  <TableHead>สาขาวิชา</TableHead>
                  <TableHead>ชั้นปี</TableHead>
                  <TableHead>วิทยาเขต</TableHead>
                  <TableHead className="pr-6">บทบาท</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      ยังไม่มีผู้ใช้งานที่ลงทะเบียน
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-6 font-medium">
                        {u.student_id}
                      </TableCell>
                      <TableCell>{u.faculty}</TableCell>
                      <TableCell>{u.major}</TableCell>
                      <TableCell>ชั้นปีที่ {u.academic_year}</TableCell>
                      <TableCell>
                        {CAMPUS_LABELS[u.campus_type] ?? u.campus_type}
                      </TableCell>
                      <TableCell className="pr-6">
                        {u.is_admin ? (
                          <Badge>ผู้ดูแลระบบ</Badge>
                        ) : (
                          <Badge variant="secondary">นักศึกษา</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
