import {
  announcements,
  assignments,
  buildAttendance,
  grades,
  schedule,
  subjects,
  type Announcement,
  type AttendanceRecord,
  type Assignment,
  type GradeRow,
  type ScheduleSlot,
  type Subject,
} from "@/lib/mock-data"

const latency = (ms = 350) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Bản sao trong bộ nhớ để mô phỏng thay đổi dữ liệu (đánh dấu đã đọc, nộp bài...).
let announcementStore: Announcement[] = announcements.map((a) => ({ ...a }))
let assignmentStore: Assignment[] = assignments.map((a) => ({ ...a }))

export async function fetchSubjects(): Promise<Subject[]> {
  await latency(150)
  return subjects
}

export async function fetchSchedule(): Promise<ScheduleSlot[]> {
  await latency()
  return schedule
}

export async function fetchGrades(): Promise<GradeRow[]> {
  await latency()
  return grades
}

export async function fetchAttendance(year: number, month: number): Promise<AttendanceRecord[]> {
  await latency()
  return buildAttendance(year, month)
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await latency()
  return announcementStore
}

export async function markAnnouncementRead(id: string): Promise<void> {
  announcementStore = announcementStore.map((a) => (a.id === id ? { ...a, read: true } : a))
}

export async function markAllAnnouncementsRead(): Promise<void> {
  await latency(200)
  announcementStore = announcementStore.map((a) => ({ ...a, read: true }))
}

export async function fetchAssignments(): Promise<Assignment[]> {
  await latency()
  return assignmentStore
}

export async function toggleAssignment(id: string): Promise<void> {
  assignmentStore = assignmentStore.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
}
