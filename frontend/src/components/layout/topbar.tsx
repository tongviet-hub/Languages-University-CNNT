import { Bell, Search } from "lucide-react"
import { Link } from "react-router-dom"

import { useAnnouncements } from "@/api/queries"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useI18n } from "@/lib/i18n"

export function Topbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { t } = useI18n()
  const { data } = useAnnouncements()
  const unread = data?.filter((a) => !a.read).length ?? 0

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <SidebarTrigger className="-ml-1" aria-label={t("sidebar.toggle")} />
      <Separator orientation="vertical" className="mx-2 h-5" />

      <button
        type="button"
        onClick={onOpenSearch}
        className="group flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">{t("topbar.search")}</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("nav.announcements")}
          className="relative"
          nativeButton={false}
          render={<Link to="/announcements" />}
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
