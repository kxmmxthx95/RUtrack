import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CAMPUS_LABELS,
  getFaculties,
  getMajorsByFaculty,
  type CampusCatalogKey,
} from "@/lib/universityCatalog"
import { cn } from "@/lib/utils"
import type { CurriculumNodeKey } from "@/lib/curriculum"

const CAMPUSES = Object.keys(CAMPUS_LABELS) as CampusCatalogKey[]
const ACADEMIC_YEARS = Array.from({ length: 10 }, (_, i) => 2560 + i)

interface CurriculumTreeProps {
  selected: CurriculumNodeKey | null
  onSelect: (node: CurriculumNodeKey) => void
}

export function CurriculumTree({ selected, onSelect }: CurriculumTreeProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {CAMPUSES.map((campus) => (
        <AccordionItem key={campus} value={campus}>
          <AccordionTrigger className="px-2">
            {CAMPUS_LABELS[campus]}
          </AccordionTrigger>
          <AccordionContent className="pl-2">
            <Accordion type="single" collapsible className="w-full">
              {ACADEMIC_YEARS.map((year) => (
                <AccordionItem key={year} value={`${campus}-${year}`}>
                  <AccordionTrigger className="px-2 text-sm font-normal">
                    ปีการศึกษา {year}
                  </AccordionTrigger>
                  <AccordionContent className="pl-2">
                    <Accordion type="single" collapsible className="w-full">
                      {getFaculties(campus).map((faculty) => (
                        <AccordionItem
                          key={faculty.name}
                          value={`${campus}-${year}-${faculty.name}`}
                        >
                          <AccordionTrigger className="px-2 text-sm font-normal">
                            {faculty.name}
                          </AccordionTrigger>
                          <AccordionContent className="pl-2">
                            <div className="flex flex-col gap-0.5">
                              {getMajorsByFaculty(campus, faculty.name).map(
                                (major) => {
                                  const isActive =
                                    selected?.campus === campus &&
                                    selected.academicYear === year &&
                                    selected.faculty === faculty.name &&
                                    selected.major === major.name
                                  return (
                                    <button
                                      key={major.name}
                                      type="button"
                                      onClick={() =>
                                        onSelect({
                                          campus,
                                          academicYear: year,
                                          faculty: faculty.name,
                                          major: major.name,
                                        })
                                      }
                                      className={cn(
                                        "rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                        isActive
                                          ? "bg-primary text-primary-foreground"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                      )}
                                    >
                                      {major.name}
                                    </button>
                                  )
                                },
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
