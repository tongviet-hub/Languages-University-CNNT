import { Bell, CheckCheck, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { useAnnouncements, useMarkAllRead, useMarkRead } from "@/api/queries"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { DictKey } from "@/lib/dictionary"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import type { Announcement, AnnouncementCategory } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type CategoryFilter = AnnouncementCategory | "all"

const categories: { value: CategoryFilter; labelKey: DictKey }[] = [
  { value: "all", labelKey: "ann.cat.all" },
  { value: "academic", labelKey: "ann.cat.academic" },
  { value: "event", labelKey: "ann.cat.event" },
  { value: "urgent", labelKey: "ann.cat.urgent" },
  { value: "activity", labelKey: "ann.cat.activity" },
]

export default function AnnouncementsPage() {
  const { t, tr, locale } = useI18n()
  const { data, isLoading } = useAnnouncements()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryFilter>("all")
  const [selected, setSelected] = useState<Announcement | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data ?? []).filter(
      (a) =>
        (category === "all" || a.category === category) &&
        (!q || tr(a.title).toLowerCase().includes(q) || tr(a.summary).toLowerCase().includes(q))
    )
  }, [data, query, category, tr])

  const unread = data?.filter((a) => !a.read).length ?? 0

  const open = (a: Announcement) => {
    setSelected(a)
    if (!a.read) markRead.mutate(a.id)
  }

  return (
    <div>
      <PageHeader
        title={t("nav.announcements")}
        description={unread ? t("ann.unreadCount", { n: unread }) : t("ann.allRead")}
        actions={
          <Button
            variant="outline"
            disabled={!unread || markAll.isPending}
            onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.success(t("ann.markedToast")) })}
          >
            <CheckCheck /> {t("ann.markAll")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ann.search")}
            aria-label={t("ann.searchLabel")}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              aria-pressed={category === c.value}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                category === c.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t("ann.empty")}
            description={t("ann.emptyDesc")}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setCategory("all")
                }}
              >
                {t("ann.clear")}
              </Button>
            }
          />
        ) : (
          filtered.map((a) => (
            <Card
              key={a.id}
              size="sm"
              className={cn("cursor-pointer transition-shadow hover:shadow-md", !a.read && "border-primary/30 bg-accent/30")}
            >
              <CardContent>
                <button
                  type="button"
                  onClick={() => open(a)}
                  className="flex w-full items-start gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span
                    aria-label={a.read ? undefined : t("dash.unreadLabel")}
                    className={cn("mt-2 size-2 shrink-0 rounded-full", a.read ? "bg-transparent" : "bg-primary")}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={a.category === "urgent" ? "destructive" : "secondary"}>
                        {t(`ann.cat.${a.category}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tr(a.author)} · {formatDate(a.date, locale)}
                      </span>
                    </div>
                    <p className={cn("mt-1.5", a.read ? "font-medium" : "font-semibold")}>{tr(a.title)}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{tr(a.summary)}</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected && tr(selected.title)}</DialogTitle>
            <DialogDescription>
              {selected && `${tr(selected.author)} · ${formatDate(selected.date, locale)} · ${t(`ann.cat.${selected.category}`)}`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed">{selected && tr(selected.content)}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
