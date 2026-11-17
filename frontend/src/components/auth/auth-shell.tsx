import { BookOpen, CalendarCheck, GraduationCap, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { brand } from "@/lib/brand"
import type { DictKey } from "@/lib/dictionary"
import { useI18n } from "@/lib/i18n"

const highlights: { icon: typeof BookOpen; textKey: DictKey }[] = [
  { icon: CalendarCheck, textKey: "login.highlight1" },
  { icon: BookOpen, textKey: "login.highlight2" },
  { icon: Sparkles, textKey: "login.highlight3" },
]

/** Khung chung của trang Đăng nhập và Đăng ký: ảnh giới thiệu bên trái (màn hình lớn), form bên phải. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { t, tr } = useI18n()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
        <img src="/images/library-aisle.jpg" alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-white text-primary shadow-lg">
            <GraduationCap className="size-6" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-semibold">{tr(brand.portalName)}</p>
            <p className="text-sm text-white/80">{tr(brand.name)}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">{t("login.heroTitle")}</h1>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, textKey }) => (
              <li key={textKey} className="flex items-center gap-3 text-white/90">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Icon className="size-4" />
                </span>
                {t(textKey)}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          {t("common.copyright", { year: brand.year, name: tr(brand.name) })}
        </p>
      </aside>

      <main className="relative flex items-center justify-center bg-background p-6">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </div>
            <p className="font-semibold">{tr(brand.portalName)}</p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          {children}
        </div>
      </main>
    </div>
  )
}
