import { Bell, CalendarCheck, CheckCircle2, ClipboardList, GraduationCap, Trophy } from "lucide-react"
import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  useAnnouncements,
  useAssignments,
  useGrades,
  useSchedule,
  useSubjects,
  useToggleAssignment,
} from "@/api/queries"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"
import { daysUntil, formatDate } from "@/lib/format"
import { averageOf, classify, periodTimes } from "@/lib/mock-data"
import { toneClasses } from "@/lib/tones"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useAuth()
  const { t, tr, locale } = useI18n()
  const subjects = useSubjects()
  const schedule = useSchedule()
  const grades = useGrades()
  const announcements = useAnnouncements()
  const assignments = useAssignments()
  const toggle = useToggleAssignment()

  const todayIndex = (new Date().getDay() + 6) % 7 // 0 = Thứ 2
  const subjectById = (id: string) => subjects.data?.find((s) => s.id === id)
  const todaySlots = (schedule.data ?? []).filter((s) => s.day === todayIndex).sort((a, b) => a.period - b.period)

  const sem2 = (grades.data ?? []).filter((g) => g.semester === 2)
  const gpa = sem2.length ? sem2.reduce((sum, g) => sum + averageOf(g), 0) / sem2.length : 0
  const pending = (assignments.data ?? []).filter((a) => !a.done)
  const unread = (announcements.data ?? []).filter((a) => !a.read)

  const chartData = (subjects.data ?? []).map((s) => {
    const avg = (sem: 1 | 2) => {
      const row = grades.data?.find((g) => g.subjectId === s.id && g.semester === sem)
      return row ? averageOf(row) : 0
    }
    return { name: tr(s.name), sem1: avg(1), sem2: avg(2) }
  })

  return (
    <div>
      <PageHeader
        title={t("dash.hello", { name: user?.name.split(" ").slice(-1)[0] ?? "" })}
        description={new Date().toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dash.statGpa")}
          value={gpa.toFixed(2)}
          hint={t("dash.gpaHint", { level: t(`level.${classify(gpa).level}`) })}
          icon={Trophy}
          loading={grades.isLoading}
        />
        <StatCard
          label={t("dash.statAttendance")}
          value="94%"
          hint={t("dash.attendanceHint")}
          icon={CalendarCheck}
        />
        <StatCard
          label={t("dash.statPending")}
          value={String(pending.length)}
          hint={t("dash.pendingHint")}
          icon={ClipboardList}
          loading={assignments.isLoading}
        />
        <StatCard
          label={t("dash.statUnread")}
          value={String(unread.length)}
          hint={t("dash.unreadHint")}
          icon={Bell}
          loading={announcements.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dash.chartTitle")}</CardTitle>
            <CardDescription>{t("dash.chartDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {grades.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} width={28} />
                    <Tooltip
                      cursor={{ fill: "var(--accent)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="sem1" name={t("sem.1")} fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="sem2" name={t("sem.2")} fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: "var(--chart-4)" }} /> {t("sem.1")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: "var(--chart-1)" }} /> {t("sem.2")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dash.todayTitle")}</CardTitle>
            <CardDescription>{t("dash.periodCount", { n: todaySlots.length })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : todaySlots.length === 0 ? (
              <EmptyState icon={CheckCircle2} title={t("dash.noClass")} description={t("dash.noClassDesc")} />
            ) : (
              todaySlots.map((slot) => {
                const subject = subjectById(slot.subjectId)
                if (!subject) return null
                return (
                  <div
                    key={`${slot.day}-${slot.period}`}
                    className={cn("flex items-center gap-3 rounded-xl border p-3", toneClasses[subject.tone])}
                  >
                    <div className="w-12 shrink-0 text-center text-xs font-semibold">{t("dash.period", { n: slot.period })}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{tr(subject.name)}</p>
                      <p className="truncate text-xs opacity-80">
                        {periodTimes[slot.period - 1]} · {tr(subject.room)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.assignTitle")}</CardTitle>
            <CardDescription>{t("dash.assignDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignments.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              : assignments.data?.map((a) => {
                  const subject = subjectById(a.subjectId)
                  const left = daysUntil(a.due)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle.mutate(a.id)}
                      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <CheckCircle2
                        className={cn("size-5 shrink-0", a.done ? "text-primary" : "text-muted-foreground/40")}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", a.done && "text-muted-foreground line-through")}>
                          {tr(a.title)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subject && tr(subject.name)} · {t("dash.due", { date: formatDate(a.due, locale) })}
                        </p>
                      </div>
                      {!a.done && (
                        <Badge variant={left <= 2 ? "destructive" : "secondary"}>
                          {left < 0 ? t("dash.overdue") : left === 0 ? t("dash.today") : t("dash.daysLeft", { n: left })}
                        </Badge>
                      )}
                    </button>
                  )
                })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dash.recentTitle")}</CardTitle>
            <CardDescription>{t("dash.recentDesc")}</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/announcements" />}>
                {t("dash.viewAll")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcements.isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              : announcements.data?.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    to="/announcements"
                    className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <GraduationCap className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tr(a.title)}</p>
                      <p className="text-xs text-muted-foreground">
                        {tr(a.author)} · {formatDate(a.date, locale)}
                      </p>
                    </div>
                    {!a.read && <span aria-label={t("dash.unreadLabel")} className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                  </Link>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
