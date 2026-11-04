import { useState } from "react"

import { useGrades, useSubjects } from "@/api/queries"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { averageOf, classify } from "@/lib/mock-data"
import { BookOpenCheck, Medal, TrendingUp } from "lucide-react"

export default function GradesPage() {
  const { t, tr } = useI18n()
  const { data: grades, isLoading } = useGrades()
  const { data: subjects } = useSubjects()
  const [semester, setSemester] = useState<"1" | "2">("2")

  const rows = (grades ?? []).filter((g) => g.semester === Number(semester))
  const averages = rows.map(averageOf)
  const gpa = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0
  const best = rows.length ? rows[averages.indexOf(Math.max(...averages))] : undefined
  const bestSubject = subjects?.find((s) => s.id === best?.subjectId)
  const bestName = bestSubject && tr(bestSubject.name)
  const result = classify(gpa)

  return (
    <div>
      <PageHeader
        title={t("grades.title")}
        description={t("grades.desc")}
        actions={
          <Tabs value={semester} onValueChange={(v) => setSemester(v as "1" | "2")}>
            <TabsList>
              <TabsTrigger value="1" className="px-4">
                {t("sem.1")}
              </TabsTrigger>
              <TabsTrigger value="2" className="px-4">
                {t("sem.2")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("grades.gpa")} value={gpa.toFixed(2)} icon={TrendingUp} loading={isLoading} />
        <StatCard label={t("grades.rank")} value={t(`level.${result.level}`)} icon={Medal} loading={isLoading} />
        <StatCard
          label={t("grades.best")}
          value={bestName ?? "—"}
          hint={best ? t("grades.points", { n: averageOf(best).toFixed(1) }) : undefined}
          icon={BookOpenCheck}
          loading={isLoading}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("grades.detail")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("grades.col.subject")}</TableHead>
                  <TableHead className="text-center">{t("grades.col.attendance")}</TableHead>
                  <TableHead className="text-center">{t("grades.col.homework")}</TableHead>
                  <TableHead className="text-center">{t("grades.col.midterm")}</TableHead>
                  <TableHead className="text-center">{t("grades.col.final")}</TableHead>
                  <TableHead className="min-w-36">{t("grades.col.average")}</TableHead>
                  <TableHead className="text-right">{t("grades.col.rank")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => {
                  const subject = subjects?.find((s) => s.id === g.subjectId)
                  const avg = averageOf(g)
                  const c = classify(avg)
                  return (
                    <TableRow key={g.subjectId}>
                      <TableCell>
                        <p className="font-medium">{subject && tr(subject.name)}</p>
                        <p className="text-xs text-muted-foreground">{subject && tr(subject.teacher)}</p>
                      </TableCell>
                      <TableCell className="text-center">{g.oral}</TableCell>
                      <TableCell className="text-center">{g.test15}</TableCell>
                      <TableCell className="text-center">{g.test45}</TableCell>
                      <TableCell className="text-center">{g.final}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-8 font-semibold">{avg.toFixed(1)}</span>
                          <Progress value={avg * 10} className="h-1.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={c.tone === "good" ? "default" : "secondary"}>{t(`level.${c.level}`)}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
