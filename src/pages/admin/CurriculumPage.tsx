import { useState } from "react"
import { CurriculumTree } from "@/components/admin/CurriculumTree"
import { CurriculumDetailPanel } from "@/components/admin/CurriculumDetailPanel"
import { Card, CardContent } from "@/components/ui/card"
import type { CurriculumNodeKey } from "@/lib/curriculum"
import { cn } from "@/lib/utils"

export default function CurriculumPage() {
  const [selected, setSelected] = useState<CurriculumNodeKey | null>(null)

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        จัดการรายวิชาตามโครงสร้างวิทยาเขต ปีการศึกษา คณะ และสาขา
      </p>

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Master: campus > academic_year > faculty > major tree */}
        <Card
          className={cn(
            "w-full shrink-0 py-3 md:w-80",
            selected && "hidden md:block",
          )}
        >
          <CardContent className="max-h-[70vh] overflow-y-auto px-2">
            <CurriculumTree selected={selected} onSelect={setSelected} />
          </CardContent>
        </Card>

        {/* Detail: course list + add form for the selected major */}
        <div className={cn("min-w-0 flex-1", !selected && "hidden md:block")}>
          <CurriculumDetailPanel
            node={selected}
            onBack={() => setSelected(null)}
          />
        </div>
      </div>
    </div>
  )
}
