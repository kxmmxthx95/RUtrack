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
      { name: "นิติศาสตรบัณฑิต (น.บ.)", majors: [{ name: "นิติศาสตร์" }] },
    ],
  },
  {
    name: "คณะรัฐศาสตร์",
    programs: [
      {
        name: "รัฐศาสตรบัณฑิต (ร.บ.)",
        majors: [
          { name: "การปกครอง" },
          { name: "ความสัมพันธ์ระหว่างประเทศ" },
          { name: "บริหารรัฐกิจ" },
        ],
      },
    ],
  },
  {
    name: "คณะมนุษยศาสตร์",
    programs: [
      {
        name: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
        majors: [
          { name: "ภาษาไทย" },
          { name: "ภาษาอังกฤษ" },
          { name: "ภาษาจีน" },
          { name: "ภาษาญี่ปุ่น" },
          { name: "ภาษาฝรั่งเศส" },
          { name: "ภาษาเยอรมัน" },
          { name: "ภาษารัสเซีย" },
          { name: "ภาษาสเปน" },
          { name: "ภาษาอาหรับ" },
          { name: "ประวัติศาสตร์" },
          { name: "ปรัชญา" },
          { name: "สังคมวิทยาและมานุษยวิทยา" },
          { name: "สารสนเทศศึกษา" },
        ],
      },
    ],
  },
  {
    name: "คณะบริหารธุรกิจ",
    programs: [
      {
        name: "บริหารธุรกิจบัณฑิต (บธ.บ.)",
        majors: [
          { name: "การจัดการ" },
          { name: "การสื่อสารธุรกิจยุคดิจิทัล" },
          { name: "การตลาด" },
          { name: "การบริหารทรัพยากรมนุษย์" },
          { name: "อุตสาหกรรมบริการและการท่องเที่ยว" },
          { name: "ธุรกิจระหว่างประเทศ" },
          { name: "การเงินและการธนาคาร" },
          { name: "การจัดการโลจิสติกส์และโซ่อุปทาน" },
        ],
      },
      {
        name: "บัญชีบัณฑิต (บช.บ.)",
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
        name: "เศรษฐศาสตรบัณฑิต (ศ.บ.)",
        majors: [{ name: "เศรษฐศาสตร์" }],
      },
    ],
  },
  {
    name: "คณะศึกษาศาสตร์",
    programs: [
      {
        name: "ศึกษาศาสตรบัณฑิต (ศษ.บ.)",
        majors: [
          { name: "การประถมศึกษา" },
          { name: "ภาษาอังกฤษ" },
          { name: "ภาษาจีน" },
          { name: "สังคมศึกษา" },
          { name: "คณิตศาสตร์" },
          { name: "คอมพิวเตอร์ศึกษา" },
          { name: "พลศึกษา" },
          { name: "ภาษาไทย" },
          { name: "การศึกษาปฐมวัย" },
          { name: "ศิลปศึกษา" },
          { name: "วิทยาศาสตร์ทั่วไป" },
          { name: "สุขศึกษาและพลศึกษา" },
          { name: "เทคโนโลยีอุตสาหกรรมและเกษตรศึกษา" },
          { name: "การศึกษาตลอดชีวิต" },
          { name: "การศึกษาพิเศษ" },
          { name: "เทคโนโลยีดิจิทัลและนวัตกรรมการเรียนรู้" },
          { name: "การวัดผล การประเมินผลและการวิจัยทางการศึกษา" },
        ],
      },
      {
        name: "วิทยาศาสตรบัณฑิต (วท.บ.)",
        majors: [
          { name: "วิทยาศาสตร์การกีฬา" },
          { name: "การจัดการกีฬาและนันทนาการ" },
          { name: "วิทยาศาสตร์การกีฬาประยุกต์" },
          { name: "ภูมิศาสตร์" },
          { name: "จิตวิทยาอุตสาหกรรมและองค์การ" },
          { name: "คหกรรมศาสตร์" },
        ],
      },
      {
        name: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
        majors: [
          { name: "จิตวิทยาการปรึกษา" },
          { name: "จิตวิทยา" },
        ],
      },
    ],
  },
  {
    name: "คณะศิลปกรรมศาสตร์",
    programs: [
      {
        name: "ศิลปกรรมศาสตรบัณฑิต (ศป.บ.)",
        majors: [
          { name: "ดนตรีสากล" },
          { name: "ดนตรีไทย" },
          { name: "นาฏกรรมไทย" },
        ],
      },
    ],
  },
  {
    name: "คณะสื่อสารมวลชน",
    programs: [
      {
        name: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
        majors: [
          { name: "นิเทศศาสตร์และสื่อดิจิทัล" },
          { name: "ภาพยนตร์ดิจิทัลและสื่อสร้างสรรค์" },
        ],
      },
    ],
  },
  {
    name: "คณะพัฒนาทรัพยากรมนุษย์",
    programs: [
      {
        name: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
        majors: [{ name: "การพัฒนาทรัพยากรมนุษย์" }],
      },
    ],
  },
  {
    name: "คณะวิทยาศาสตร์",
    programs: [
      {
        name: "วิทยาศาสตรบัณฑิต (วท.บ.)",
        majors: [
          { name: "คณิตศาสตร์" },
          { name: "สถิติ" },
          { name: "เคมี" },
          { name: "ฟิสิกส์" },
          { name: "ชีววิทยา" },
          { name: "วิทยาการคอมพิวเตอร์" },
          { name: "เทคโนโลยีวัสดุ" },
          { name: "เทคโนโลยีอาหาร" },
          { name: "เทคโนโลยีสารสนเทศ" },
          { name: "วิทยาศาสตร์สิ่งแวดล้อม" },
        ],
      },
    ],
  },
  {
    name: "คณะวิศวกรรมศาสตร์",
    programs: [
      {
        name: "วิศวกรรมศาสตรบัณฑิต (วศ.บ.)",
        majors: [
          { name: "วิศวกรรมโยธา" },
          { name: "วิศวกรรมอุตสาหการ" },
          { name: "วิศวกรรมความปลอดภัย อาชีวอนามัยและสิ่งแวดล้อม" },
          { name: "วิศวกรรมคอมพิวเตอร์" },
          { name: "วิศวกรรมคอมพิวเตอร์ (ภาคพิเศษภาษาอังกฤษ)" },
          { name: "วิศวกรรมพลังงาน" },
          { name: "วิศวกรรมยานยนต์ไฟฟ้าสมัยใหม่" },
        ],
      },
    ],
  },
  {
    name: "คณะสาธารณสุขศาสตร์",
    programs: [
      {
        name: "สาธารณสุขศาสตรบัณฑิต (ส.บ.)",
        majors: [{ name: "สาธารณสุขชุมชน" }],
      },
      {
        name: "วิทยาศาสตรบัณฑิต (วท.บ.)",
        majors: [{ name: "อาชีวอนามัยและความปลอดภัย" }],
      },
    ],
  },
  {
    name: "คณะทัศนมาตรศาสตร์",
    programs: [
      { name: "ทัศนมาตรศาสตรบัณฑิต (ทม.บ.)", majors: [{ name: "ทัศนมาตรศาสตร์" }] },
    ],
  },
  {
    name: "คณะพยาบาลศาสตร์",
    programs: [
      {
        name: "พยาบาลศาสตรบัณฑิต (พย.บ.)",
        majors: [{ name: "พยาบาลศาสตร์" }],
      },
    ],
  },
]

export const UNIVERSITY_CATALOG: Record<CampusCatalogKey, FacultyOption[]> = {
  main: BASE_CATALOG,
  bangna: BASE_CATALOG,
  regional: [
    {
      name: "คณะนิติศาสตร์",
      programs: [
        {
          name: "นิติศาสตรบัณฑิต (น.บ.)",
          majors: [{ name: "นิติศาสตร์" }],
        },
      ],
    },
    {
      name: "คณะบริหารธุรกิจ",
      programs: [
        {
          name: "บริหารธุรกิจบัณฑิต (บธ.บ.)",
          majors: [{ name: "การจัดการ" }],
        },
      ],
    },
    {
      name: "คณะรัฐศาสตร์",
      programs: [
        {
          name: "รัฐศาสตรบัณฑิต (ร.บ.)",
          majors: [{ name: "บริหารรัฐกิจ" }],
        },
      ],
    },
    {
      name: "คณะสื่อสารมวลชน",
      programs: [
        {
          name: "ศิลปศาสตรบัณฑิต (ศศ.บ.)",
          majors: [{ name: "นิเทศศาสตร์และสื่อดิจิทัล" }],
        },
      ],
    },
  ],
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
