import type { CampusType } from "@/types"

export type CampusCatalogKey = Exclude<CampusType, "online">

export interface MajorOption {
  name: string
}

export interface ProgramOption {
  name: string
  majors: MajorOption[]
}

export interface FacultyOption {
  name: string
  programs: ProgramOption[]
}

export const CAMPUS_LABELS: Record<CampusCatalogKey, string> = {
  main: "วิทยาเขตหลัก",
  bangna: "วิทยาเขตบางนา",
  regional: "วิทยาเขตส่วนภูมิภาค",
}

/**
 * Central catalog for faculty and major data grouped by campus.
 * Faculty list aligned to the official RU Faculty page.
 * Major lists are app-facing labels and can be refined later per program.
 */
const BASE_CATALOG: FacultyOption[] = [
  {
    name: "คณะนิติศาสตร์",
    programs: [
      { name: "นิติศาสตรบัณฑิต", majors: [{ name: "นิติศาสตร์" }] },
    ],
  },
  {
    name: "คณะรัฐศาสตร์",
    programs: [
      {
        name: "รัฐศาสตรบัณฑิต",
        majors: [
          { name: "รัฐศาสตร์" },
          { name: "รัฐศาสตร์ (ภาคพิเศษ)" },
        ],
      },
    ],
  },
  {
    name: "คณะมนุษยศาสตร์",
    programs: [
      {
        name: "ศิลปศาสตรบัณฑิต",
        majors: [
          { name: "ภาษาอังกฤษ" },
          { name: "ภาษาไทย" },
          { name: "ภาษาจีน" },
          { name: "ภาษาฝรั่งเศส" },
          { name: "ภาษาเยอรมัน" },
          { name: "ภาษาญี่ปุ่น" },
          { name: "ประวัติศาสตร์" },
          { name: "ประวัติศาสตร์เพื่อการท่องเที่ยว" },
          { name: "สารสนเทศศึกษา" },
          { name: "ปรัชญา" },
          { name: "ภาษารัสเซีย" },
          { name: "สังคมวิทยาและมานุษยวิทยา" },
          { name: "ภาษาสเปน" },
          { name: "ภาษาตะวันตก" },
        ],
      },
    ],
  },
  {
    name: "คณะบริหารธุรกิจ",
    programs: [
      {
        name: "บริหารธุรกิจบัณฑิต (B.B.A.)",
        majors: [
          { name: "การจัดการ" },
          { name: "การสื่อสารธุรกิจยุคดิจิทัล" },
          { name: "การตลาด" },
          { name: "การบริหารทรัพยากรมนุษย์" },
          { name: "อุตสาหกรรมบริการและการท่องเที่ยว" },
          { name: "ธุรกิจระหว่างประเทศ" },
          { name: "การเงินและการธนาคาร" },
          { name: "โลจิสติกส์และโซ่อุปทาน" },
          { name: "การจัดการโลจิสติกส์และโซ่อุปทาน" },
        ],
      },
      {
        name: "บัญชีบัณฑิต (B.Acc.)",
        majors: [
          { name: "การบัญชี" },
          { name: "การบัญชีและการเงิน" },
        ],
      },
    ],
  },
  {
    name: "คณะเศรษฐศาสตร์",
    programs: [
      {
        name: "เศรษฐศาสตรบัณฑิต",
        majors: [
          { name: "เศรษฐศาสตร์คณิตศาสตร์" },
          { name: "การบริหารความเสี่ยงทางการเงิน" },
          { name: "การคลังและการพัฒนาเศรษฐกิจสาธารณะ" },
          { name: "เศรษฐศาสตร์ระหว่างประเทศและโลกาภิวัตน์" },
          { name: "เศรษฐศาสตร์การเกษตร" },
        ],
      },
    ],
  },
  {
    name: "คณะศึกษาศาสตร์",
    programs: [
      {
        name: "ศึกษาศาสตรบัณฑิต",
        majors: [
          { name: "ประถมศึกษา" },
          { name: "ภาษาอังกฤษ" },
          { name: "ภาษาจีน" },
          { name: "สังคมศึกษา" },
          { name: "คณิตศาสตร์" },
          { name: "คอมพิวเตอร์ศึกษา" },
          { name: "พลศึกษา" },
          { name: "สุขศึกษา" },
          { name: "ภาษาไทย" },
          { name: "การศึกษาปฐมวัย" },
          { name: "ศิลปศึกษา" },
          { name: "วิทยาศาสตร์" },
        ],
      },
      {
        name: "วิทยาศาสตรบัณฑิต",
        majors: [
          { name: "วิทยาศาสตร์การกีฬา" },
          { name: "สันทนาการ" },
        ],
      },
      {
        name: "ศิลปศาสตรบัณฑิต",
        majors: [
          { name: "จิตวิทยา" },
          { name: "จิตวิทยาการปรึกษา" },
          { name: "จิตวิทยาอุตสาหกรรมและองค์การ" },
          { name: "ภูมิศาสตร์" },
        ],
      },
    ],
  },
  {
    name: "คณะศิลปกรรมศาสตร์",
    programs: [
      {
        name: "ศิลปกรรมศาสตรบัณฑิต",
        majors: [
          { name: "นาฏศิลป์ไทย" },
          { name: "ดนตรีไทย" },
          { name: "ดนตรีสมัยนิยม" },
          { name: "ดนตรีตะวันตก" },
        ],
      },
    ],
  },
  {
    name: "คณะสื่อสารมวลชน",
    programs: [
      {
        name: "นิเทศศาสตรบัณฑิต",
        majors: [
          { name: "นิเทศศาสตร์" },
          { name: "การสื่อสารแบบบูรณาการ" },
          { name: "วารสารศาสตร์มัลติมีเดีย" },
          { name: "การกระจายเสียงและแพร่ภาพ" },
        ],
      },
    ],
  },
  {
    name: "คณะพัฒนาทรัพยากรมนุษย์",
    programs: [
      {
        name: "การพัฒนาทรัพยากรมนุษย์บัณฑิต",
        majors: [{ name: "การพัฒนาทรัพยากรมนุษย์" }],
      },
    ],
  },
  {
    name: "คณะวิทยาศาสตร์",
    programs: [
      {
        name: "วิทยาศาสตรบัณฑิต",
        majors: [
          { name: "คณิตศาสตร์" },
          { name: "วิทยาศาสตร์สถิติ" },
          { name: "เคมี" },
          { name: "ฟิสิกส์" },
          { name: "ชีววิทยา" },
          { name: "วิทยาการคอมพิวเตอร์" },
          { name: "วิจัยดำเนินงาน" },
          { name: "วัสดุศาสตร์" },
          { name: "เทคโนโลยีอาหาร" },
          { name: "อิเล็กทรอนิกส์" },
          { name: "เทคโนโลยีชีวภาพ" },
          { name: "วิทยาศาสตร์สิ่งแวดล้อม" },
          { name: "เทคโนโลยีการเกษตร" },
          { name: "รังสีเทคนิค" },
          { name: "เทคโนโลยีสารสนเทศ" },
        ],
      },
    ],
  },
  {
    name: "คณะวิศวกรรมศาสตร์",
    programs: [
      {
        name: "วิศวกรรมศาสตรบัณฑิต",
        majors: [
          { name: "วิศวกรรมโยธา" },
          { name: "วิศวกรรมอุตสาหการ" },
          { name: "วิศวกรรมสิ่งแวดล้อม" },
          { name: "วิศวกรรมคอมพิวเตอร์" },
        ],
      },
    ],
  },
  {
    name: "คณะสาธารณสุขศาสตร์",
    programs: [
      {
        name: "สาธารณสุขศาสตรบัณฑิต",
        majors: [{ name: "สาธารณสุขศาสตร์" }],
      },
    ],
  },
  {
    name: "คณะทัศนมาตรศาสตร์",
    programs: [
      { name: "ทัศนมาตรศาสตรบัณฑิต", majors: [] },
    ],
  },
  {
    name: "คณะพยาบาลศาสตร์",
    programs: [
      {
        name: "พยาบาลศาสตรบัณฑิต",
        majors: [{ name: "พยาบาลศาสตร์" }],
      },
    ],
  },
]

export const UNIVERSITY_CATALOG: Record<CampusCatalogKey, FacultyOption[]> = {
  main: BASE_CATALOG,
  bangna: BASE_CATALOG,
  regional: BASE_CATALOG,
}

export function getFaculties(campus: CampusCatalogKey): FacultyOption[] {
  return UNIVERSITY_CATALOG[campus]
}

export function getPrograms(campus: CampusCatalogKey, facultyName: string): ProgramOption[] {
  return UNIVERSITY_CATALOG[campus].find((f) => f.name === facultyName)?.programs ?? []
}

export function getMajors(
  campus: CampusCatalogKey,
  facultyName: string,
  programName: string,
): MajorOption[] {
  const faculty = UNIVERSITY_CATALOG[campus].find((f) => f.name === facultyName)
  return faculty?.programs.find((p) => p.name === programName)?.majors ?? []
}
