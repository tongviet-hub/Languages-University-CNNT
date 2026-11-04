import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { useAttendance } from "@/api/queries"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { DictKey } from "@/lib/dictionary"
import { useI18n } from "@/lib/i18n"
import type { AttendanceStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const statusMeta: Record<AttendanceStatus, { labelKey: DictKey; cell: string; dot: string }> = {
  present: {
    labelKey: "att.present",
    cell: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  absent: { labelKey: "att.absent", cell: "bg-primary text-primary-foreground", dot: "bg-primary" },
  late: {
    labelKey: "att.late",
    cell: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  excused: {
    labelKey: "att.excused",
    cell: "bg-stone-100 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300",
    dot: "bg-stone-400",
  },
}

const weekdays: DictKey[] = ["wd.0", "wd.1", "wd.2", "wd.3", "wd.4", "wd.5", "wd.6"]

export default function AttendancePage() {
  const { t, locale } = useI18n()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const { data, isLoading } = useAttendance(cursor.year, cursor.month)

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const offset = (new Date(cursor.year, cursor.month, 1).getDay() + 6) % 7
  const byDay = new Map((data ?? []).map((r) => [Number(r.date.slice(8, 10)), r.status]))

  const counts = { present: 0, absent: 0, late: 0, excused: 0 } satisfies Record<AttendanceStatus, number>
  for (const r of data ?? []) counts[r.status]++
  const total = data?.length ?? 0
  const rate = total ? Math.round(((counts.present + counts.late + counts.excused) / total) * 100) : 0

  const title = new Date(cursor.year, cursor.month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })
  const isCurrent = cursor.year === now.getFullYear() && cursor.month === now.getMonth()

  return (
    <div>
      <PageHeader
        title={t("att.title")}
        description={t("att.desc")}
        actions={
          <>
            <Button variant="outline" size="icon" aria-label={t("att.prev")} onClick={() => shift(-1)}>
              <ChevronLeft />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium capitalize">{title}</span>
            <Button variant="outline" size="icon" aria-label={t("att.next")} onClick={() => shift(1)}>
              <ChevronRight />
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
                  {weekdays.map((w) => (
                    <div key={w} className="py-1">
                      {t(w)}
                    </div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1.5">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`o${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const status = byDay.get(day)
                    const isToday = isCurrent && day === now.getDate()
                    return (
                      <div
                        key={day}
                        title={status ? t(statusMeta[status].labelKey) : t("att.noClass")}
                        className={cn(
                          "flex aspect-square items-center justify-center rounded-xl text-sm font-medium",
                          status ? statusMeta[status].cell : "text-muted-foreground/50",
                          isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                        )}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {(Object.keys(statusMeta) as AttendanceStatus[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={cn("size-2.5 rounded-full", statusMeta[k].dot)} />
                  {t(statusMeta[k].labelKey)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("att.summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-tight">{rate}%</p>
                <p className="text-sm text-muted-foreground">{t("att.rate")}</p>
              </div>
              <Progress value={rate} className="mt-3 h-2" />
            </div>
            <ul className="space-y-3">
              {(Object.keys(statusMeta) as AttendanceStatus[]).map((k) => (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", statusMeta[k].dot)} />
                    {t(statusMeta[k].labelKey)}
                  </span>
                  <span className="font-semibold">{t("att.sessions", { n: counts[k] })}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
