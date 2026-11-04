import type { Localized } from "@/lib/locale"

export type Role = "student" | "teacher"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  className: Localized
  studentCode: string
  phone: string
  address: Localized
  birthday: string
}

export interface Subject {
  id: string
  name: Localized
  teacher: Localized
  room: Localized
  tone: "red" | "rose" | "orange" | "amber" | "pink" | "stone"
}

export interface ScheduleSlot {
  day: number // 0 = Thứ 2 ... 5 = Thứ 7
  period: number // 1..8
  subjectId: string
}

export interface GradeRow {
  subjectId: string
  semester: 1 | 2
  oral: number
  test15: number
  test45: number
  final: number
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export interface AttendanceRecord {
  date: string // yyyy-mm-dd
  status: AttendanceStatus
}

export type AnnouncementCategory = "academic" | "event" | "urgent" | "activity"

export interface Announcement {
  id: string
  title: Localized
  summary: Localized
  content: Localized
  category: AnnouncementCategory
  author: Localized
  date: string
  read: boolean
}

export interface Assignment {
  id: string
  title: Localized
  subjectId: string
  due: string
  done: boolean
}

export const demoUsers: Record<Role, User> = {
  student: {
    id: "u-001",
    name: "Nguyễn Minh Anh",
    email: "minhanh@sv.adu.edu.vn",
    role: "student",
    className: { vi: "Ngôn ngữ Anh – K24A2", en: "English Studies – K24A2" },
    studentCode: "SV2024-0152",
    phone: "0912 345 678",
    address: { vi: "25 Lê Lợi, Quận 1, TP. Hồ Chí Minh", en: "25 Lê Lợi, District 1, Ho Chi Minh City" },
    birthday: "2005-03-14",
  },
  teacher: {
    id: "u-002",
    name: "Trần Hoài Nam",
    email: "hoainam@adu.edu.vn",
    role: "teacher",
    className: { vi: "Cố vấn học tập K24A2", en: "Academic Advisor, K24A2" },
    studentCode: "GV-0031",
    phone: "0988 765 432",
    address: { vi: "112 Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh", en: "112 Nguyễn Trãi, District 5, Ho Chi Minh City" },
    birthday: "1985-09-02",
  },
}

const same = (v: string): Localized => ({ vi: v, en: v })

export const subjects: Subject[] = [
  {
    id: "eng",
    name: { vi: "Tiếng Anh học thuật", en: "Academic English" },
    teacher: { vi: "TS. Lê Thu Hà", en: "Dr. Lê Thu Hà" },
    room: same("A201"),
    tone: "red",
  },
  {
    id: "jpn",
    name: { vi: "Tiếng Nhật N3", en: "Japanese N3" },
    teacher: { vi: "ThS. Sato Yuki", en: "MSc. Sato Yuki" },
    room: same("A203"),
    tone: "rose",
  },
  {
    id: "kor",
    name: { vi: "Tiếng Hàn sơ cấp", en: "Elementary Korean" },
    teacher: { vi: "ThS. Kim Ji-won", en: "MSc. Kim Ji-won" },
    room: same("B105"),
    tone: "orange",
  },
  {
    id: "chi",
    name: { vi: "Tiếng Trung HSK 4", en: "Chinese HSK 4" },
    teacher: { vi: "ThS. Vương Mỹ Linh", en: "MSc. Vương Mỹ Linh" },
    room: same("B107"),
    tone: "amber",
  },
  {
    id: "tra",
    name: { vi: "Biên – Phiên dịch", en: "Translation & Interpreting" },
    teacher: { vi: "TS. Đặng Ngọc Lan", en: "Dr. Đặng Ngọc Lan" },
    room: { vi: "Lab dịch 1", en: "Translation Lab 1" },
    tone: "pink",
  },
  {
    id: "lin",
    name: { vi: "Ngôn ngữ học đối chiếu", en: "Contrastive Linguistics" },
    teacher: { vi: "PGS.TS. Bùi Văn Đức", en: "Assoc. Prof. Dr. Bùi Văn Đức" },
    room: same("A105"),
    tone: "stone",
  },
  {
    id: "cul",
    name: { vi: "Văn hóa các nước", en: "World Cultures" },
    teacher: { vi: "ThS. Hoàng Minh Tuấn", en: "MSc. Hoàng Minh Tuấn" },
    room: same("C301"),
    tone: "orange",
  },
  {
    id: "inf",
    name: { vi: "CNTT trong ngôn ngữ", en: "IT in Linguistics" },
    teacher: { vi: "ThS. Ngô Thảo Vy", en: "MSc. Ngô Thảo Vy" },
    room: same("Lab 3"),
    tone: "rose",
  },
]

export const schedule: ScheduleSlot[] = [
  { day: 0, period: 1, subjectId: "eng" },
  { day: 0, period: 2, subjectId: "eng" },
  { day: 0, period: 3, subjectId: "jpn" },
  { day: 0, period: 4, subjectId: "kor" },
  { day: 0, period: 6, subjectId: "inf" },
  { day: 1, period: 1, subjectId: "chi" },
  { day: 1, period: 2, subjectId: "chi" },
  { day: 1, period: 3, subjectId: "tra" },
  { day: 1, period: 5, subjectId: "lin" },
  { day: 2, period: 1, subjectId: "jpn" },
  { day: 2, period: 2, subjectId: "kor" },
  { day: 2, period: 3, subjectId: "eng" },
  { day: 2, period: 4, subjectId: "cul" },
  { day: 3, period: 1, subjectId: "tra" },
  { day: 3, period: 2, subjectId: "tra" },
  { day: 3, period: 3, subjectId: "chi" },
  { day: 3, period: 5, subjectId: "kor" },
  { day: 4, period: 1, subjectId: "lin" },
  { day: 4, period: 2, subjectId: "jpn" },
  { day: 4, period: 3, subjectId: "eng" },
  { day: 4, period: 4, subjectId: "inf" },
  { day: 5, period: 1, subjectId: "kor" },
  { day: 5, period: 2, subjectId: "cul" },
]

export const periodTimes = [
  "07:00 – 07:45",
  "07:50 – 08:35",
  "08:50 – 09:35",
  "09:40 – 10:25",
  "13:00 – 13:45",
  "13:50 – 14:35",
  "14:50 – 15:35",
  "15:40 – 16:25",
]

export const grades: GradeRow[] = [
  { subjectId: "eng", semester: 1, oral: 9, test15: 8.5, test45: 9, final: 9.2 },
  { subjectId: "jpn", semester: 1, oral: 8, test15: 7.5, test45: 8, final: 8.3 },
  { subjectId: "kor", semester: 1, oral: 9.5, test15: 9, test45: 9.5, final: 9.4 },
  { subjectId: "chi", semester: 1, oral: 8.5, test15: 8, test45: 8.5, final: 8.7 },
  { subjectId: "tra", semester: 1, oral: 7.5, test15: 8, test45: 7, final: 7.6 },
  { subjectId: "lin", semester: 1, oral: 8, test15: 8.5, test45: 8, final: 8.5 },
  { subjectId: "cul", semester: 1, oral: 10, test15: 9, test45: 9.5, final: 9.5 },
  { subjectId: "inf", semester: 1, oral: 9, test15: 9.5, test45: 9, final: 9.6 },
  { subjectId: "eng", semester: 2, oral: 9.5, test15: 9, test45: 9.5, final: 9.5 },
  { subjectId: "jpn", semester: 2, oral: 8.5, test15: 8, test45: 8.5, final: 8.6 },
  { subjectId: "kor", semester: 2, oral: 9.5, test15: 9.5, test45: 9, final: 9.5 },
  { subjectId: "chi", semester: 2, oral: 9, test15: 8.5, test45: 9, final: 8.9 },
  { subjectId: "tra", semester: 2, oral: 8, test15: 8.5, test45: 8, final: 8.2 },
  { subjectId: "lin", semester: 2, oral: 8.5, test15: 8, test45: 8.5, final: 8.7 },
  { subjectId: "cul", semester: 2, oral: 10, test15: 9.5, test45: 10, final: 9.8 },
  { subjectId: "inf", semester: 2, oral: 9.5, test15: 9, test45: 9.5, final: 9.7 },
]

/** Điểm học phần: hệ số 1 (chuyên cần, bài tập), hệ số 2 (giữa kỳ), hệ số 3 (cuối kỳ). */
export function averageOf(g: GradeRow) {
  const total = g.oral + g.test15 + g.test45 * 2 + g.final * 3
  return Math.round((total / 7) * 10) / 10
}

export type GradeLevel = "excellent" | "good" | "average"

export function classify(avg: number): { level: GradeLevel; tone: "good" | "ok" | "warn" } {
  if (avg >= 8) return { level: "excellent", tone: "good" }
  if (avg >= 6.5) return { level: "good", tone: "ok" }
  return { level: "average", tone: "warn" }
}

function dateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/** Dữ liệu điểm danh cho tháng hiện tại (bỏ qua Chủ nhật). */
export function buildAttendance(year: number, month: number): AttendanceRecord[] {
  const days = new Date(year, month + 1, 0).getDate()
  const out: AttendanceRecord[] = []
  for (let d = 1; d <= days; d++) {
    const wd = new Date(year, month, d).getDay()
    if (wd === 0) continue
    let status: AttendanceStatus = "present"
    if (d % 11 === 0) status = "absent"
    else if (d % 7 === 0) status = "late"
    else if (d % 13 === 0) status = "excused"
    out.push({ date: dateStr(year, month, d), status })
  }
  return out
}

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: {
      vi: "Lịch thi giữa học kỳ I năm học 2026–2027",
      en: "Midterm exam schedule, Semester I, 2026–2027",
    },
    summary: {
      vi: "Thông báo lịch thi chi tiết các học phần từ 18/11 đến 22/11.",
      en: "Detailed exam schedule for all courses from Nov 18 to Nov 22.",
    },
    content: {
      vi: "Nhà trường thông báo lịch thi giữa học kỳ I. Sinh viên có mặt trước giờ thi 15 phút, mang theo thẻ sinh viên và dụng cụ học tập. Không sử dụng tài liệu và thiết bị điện tử trong phòng thi. Lịch chi tiết từng học phần được cập nhật trên cổng thông tin.",
      en: "The university announces the Semester I midterm exam schedule. Students must arrive 15 minutes before the exam and bring their student ID and stationery. Documents and electronic devices are not allowed in the exam room. The detailed schedule for each course is posted on the portal.",
    },
    category: "academic",
    author: { vi: "Phòng Đào tạo", en: "Academic Affairs Office" },
    date: "2026-11-02",
    read: false,
  },
  {
    id: "a2",
    title: {
      vi: "Ngày hội Ngôn ngữ & Văn hóa quốc tế",
      en: "International Language & Culture Festival",
    },
    summary: {
      vi: "Các khoa đăng ký gian hàng trước ngày 10/11 với Đoàn trường.",
      en: "Faculties must register their booths with the Youth Union by Nov 10.",
    },
    content: {
      vi: "Ngày hội Ngôn ngữ & Văn hóa quốc tế sẽ diễn ra vào 14h ngày 19/11 tại hội trường lớn, với các gian hàng văn hóa Anh – Nhật – Hàn – Trung – Pháp – Đức. Các khoa, câu lạc bộ đăng ký gian hàng và tiết mục biểu diễn với Đoàn trường trước ngày 10/11.",
      en: "The International Language & Culture Festival takes place at 2 PM on Nov 19 in the main hall, with cultural booths from the UK, Japan, Korea, China, France and Germany. Faculties and clubs should register booths and performances with the Youth Union by Nov 10.",
    },
    category: "event",
    author: { vi: "Đoàn trường", en: "Youth Union" },
    date: "2026-11-01",
    read: false,
  },
  {
    id: "a3",
    title: {
      vi: "Thay đổi phòng học tuần này do bảo trì khu A",
      en: "Classroom changes this week due to Building A maintenance",
    },
    summary: {
      vi: "Các lớp khoa Ngôn ngữ Anh tạm thời học tại dãy B từ 04/11 đến 08/11.",
      en: "English Studies classes will temporarily meet in Building B from Nov 4 to Nov 8.",
    },
    content: {
      vi: "Do hạ tầng điện khu A đang được bảo trì, các lớp khoa Ngôn ngữ Anh sẽ học tại dãy B từ 04/11 đến hết 08/11. Thời khóa biểu giữ nguyên, chỉ thay đổi phòng học. Nhà trường xin lỗi vì sự bất tiện.",
      en: "Because the electrical infrastructure in Building A is under maintenance, English Studies classes will be held in Building B from Nov 4 through Nov 8. The timetable is unchanged; only the classrooms differ. We apologize for the inconvenience.",
    },
    category: "urgent",
    author: { vi: "Ban Giám hiệu", en: "Board of Rectors" },
    date: "2026-10-31",
    read: true,
  },
  {
    id: "a4",
    title: {
      vi: "Mở đăng ký câu lạc bộ học kỳ II",
      en: "Club registration opens for Semester II",
    },
    summary: {
      vi: "12 câu lạc bộ mở đơn: Tranh biện, Dịch thuật, Anime & J-Culture, K-Pop…",
      en: "12 clubs are accepting applications: Debate, Translation, Anime & J-Culture, K-Pop…",
    },
    content: {
      vi: "Sinh viên có thể đăng ký tối đa 2 câu lạc bộ cho học kỳ II tại văn phòng Đoàn hoặc thông qua cổng thông tin. Hạn đăng ký: 15/11. Buổi giới thiệu các CLB diễn ra vào giờ nghỉ trưa ngày 08/11 tại sảnh chính.",
      en: "Students may join up to 2 clubs for Semester II at the Youth Union office or through the portal. Registration deadline: Nov 15. A club showcase will be held during the lunch break on Nov 8 in the main lobby.",
    },
    category: "activity",
    author: { vi: "Đoàn trường", en: "Youth Union" },
    date: "2026-10-28",
    read: true,
  },
  {
    id: "a5",
    title: { vi: "Nhắc đóng học phí học kỳ I", en: "Reminder: Semester I tuition payment" },
    summary: {
      vi: "Hạn cuối nộp: 15/11/2026. Có thể thanh toán chuyển khoản.",
      en: "Payment deadline: Nov 15, 2026. Bank transfer is accepted.",
    },
    content: {
      vi: "Sinh viên vui lòng hoàn tất học phí học kỳ I trước ngày 15/11/2026. Nội dung chuyển khoản: Họ tên – Mã sinh viên – Học phí HK1. Mọi thắc mắc liên hệ phòng Kế hoạch – Tài chính trong giờ hành chính.",
      en: "Please complete your Semester I tuition payment before Nov 15, 2026. Transfer reference: Full name – Student ID – Semester 1 tuition. For any questions, contact the Planning & Finance Office during office hours.",
    },
    category: "academic",
    author: { vi: "Phòng Kế hoạch – Tài chính", en: "Planning & Finance Office" },
    date: "2026-10-25",
    read: true,
  },
  {
    id: "a6",
    title: {
      vi: "Cuộc thi Hùng biện tiếng Anh cấp trường – vòng loại",
      en: "University English Public Speaking Contest – qualifying round",
    },
    summary: {
      vi: "Vòng loại diễn ra lúc 15h chiều thứ Sáu tại hội trường B.",
      en: "The qualifying round takes place at 3 PM on Friday in Hall B.",
    },
    content: {
      vi: "Vòng loại cuộc thi Hùng biện tiếng Anh cấp trường sẽ diễn ra vào thứ Sáu tuần này, lúc 15h tại hội trường B. Thí sinh có mặt trước 30 phút để bốc thăm thứ tự. Cổ động viên vui lòng giữ trật tự và văn minh.",
      en: "The qualifying round of the university English Public Speaking Contest will be held this Friday at 3 PM in Hall B. Contestants should arrive 30 minutes early to draw their speaking order. Supporters are kindly asked to keep order and be respectful.",
    },
    category: "event",
    author: { vi: "Khoa Ngôn ngữ Anh", en: "Faculty of English Studies" },
    date: "2026-10-22",
    read: true,
  },
]

export const assignments: Assignment[] = [
  {
    id: "t1",
    title: {
      vi: "Essay: The role of English in global business (800 từ)",
      en: "Essay: The role of English in global business (800 words)",
    },
    subjectId: "eng",
    due: "2026-11-06",
    done: false,
  },
  {
    id: "t2",
    title: { vi: "Luyện viết 30 chữ Kanji bài 12", en: "Practice writing 30 Kanji from lesson 12" },
    subjectId: "jpn",
    due: "2026-11-07",
    done: false,
  },
  {
    id: "t3",
    title: { vi: "Dịch đoạn văn báo chí Anh – Việt", en: "Translate a news passage, English – Vietnamese" },
    subjectId: "tra",
    due: "2026-11-09",
    done: false,
  },
  {
    id: "t4",
    title: { vi: "Unit 5 – Vocabulary quiz", en: "Unit 5 – Vocabulary quiz" },
    subjectId: "eng",
    due: "2026-11-05",
    done: true,
  },
]
