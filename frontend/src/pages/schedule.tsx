import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { useSchedule, useSubjects } from "@/api/queries"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DictKey } from "@/lib/dictionary"
import { useI18n } from "@/lib/i18n"
import { periodTimes, type Subject } from "@/lib/mock-data"
import { toneClasses } from "@/lib/tones"
import { cn } from "@/lib/utils"

const dayCount = 6

function mondayOf(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export default function SchedulePage() {
  const { t, locale } = useI18n()
  const { data: slots, isLoading } = useSchedule()
  const { data: subjects } = useSubjects()
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()))

  const shift = (weeks: number) =>
    setWeekStart((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + weeks * 7)
      return next
    })

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return { index: i, date: d }
  })
  const today = new Date().toDateString()
  const fmt = (d: Date) => d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })

  return (
    <div>
      <PageHeader
        title={t("sched.title")}
        description={t("sched.week", { from: fmt(days[0].date), to: fmt(days[5].date) })}
        actions={
          <>
            <Button variant="outline" size="icon" aria-label={t("sched.prev")} onClick={() => shift(-1)}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => setWeekStart(mondayOf(new Date()))}>
              {t("sched.thisWeek")}
            </Button>
            <Button variant="outline" size="icon" aria-label={t("sched.next")} onClick={() => shift(1)}>
              <ChevronRight />
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="grid min-w-[760px] grid-cols-[88px_repeat(6,1fr)] gap-1.5">
              <div />
              {days.map((d) => {
                const isToday = d.date.toDateString() === today
                return (
                  <div
                    key={d.index}
                    className={cn(
                      "rounded-lg py-2 text-center",
                      isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    <p className="text-sm font-semibold">{t(`day.${d.index}` as DictKey)}</p>
                    <p className={cn("text-xs", isToday ? "opacity-90" : "text-muted-foreground")}>{fmt(d.date)}</p>
                  </div>
                )
              })}

              {periodTimes.map((time, pIdx) => (
                <PeriodRow key={time} period={pIdx + 1} time={time} slots={slots ?? []} subjects={subjects ?? []} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PeriodRow({
  period,
  time,
  slots,
  subjects,
}: {
  period: number
  time: string
  slots: { day: number; period: number; subjectId: string }[]
  subjects: Subject[]
}) {
  const { t, tr } = useI18n()
  return (
    <>
      <div className="flex flex-col justify-center pr-2 text-right">
        <p className="text-sm font-medium">{t("dash.period", { n: period })}</p>
        <p className="text-[11px] text-muted-foreground">{time}</p>
      </div>
      {Array.from({ length: dayCount }, (_, day) => {
        const slot = slots.find((s) => s.day === day && s.period === period)
        const subject = slot && subjects.find((s) => s.id === slot.subjectId)
        return subject ? (
          <div
            key={day}
            title={tr(subject.teacher)}
            className={cn(
              "min-h-16 rounded-lg border p-2 transition-transform hover:-translate-y-0.5 hover:shadow-sm",
              toneClasses[subject.tone]
            )}
          >
            <p className="text-sm leading-tight font-semibold">{tr(subject.name)}</p>
            <p className="mt-0.5 text-[11px] opacity-80">{tr(subject.room)}</p>
          </div>
        ) : (
          <div key={day} className="min-h-16 rounded-lg border border-dashed border-border/60" />
        )
      })}
    </>
  )
}
