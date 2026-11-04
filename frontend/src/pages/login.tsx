import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, CalendarCheck, GraduationCap, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { brand } from "@/lib/brand"
import type { DictKey } from "@/lib/dictionary"
import { useI18n } from "@/lib/i18n"
import { demoUsers, type Role } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const roles: { value: Role; labelKey: DictKey }[] = [
  { value: "student", labelKey: "login.student" },
  { value: "teacher", labelKey: "login.teacher" },
]

const highlights: { icon: typeof BookOpen; textKey: DictKey }[] = [
  { icon: CalendarCheck, textKey: "login.highlight1" },
  { icon: BookOpen, textKey: "login.highlight2" },
  { icon: Sparkles, textKey: "login.highlight3" },
]

export default function LoginPage() {
  const { user, login } = useAuth()
  const { t, tr } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role>("student")

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("login.err.emailRequired")).email(t("login.err.emailInvalid")),
        password: z.string().min(6, t("login.err.passwordMin")),
      }),
    [t]
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: demoUsers.student.email, password: "123456" },
  })

  if (user) return <Navigate to="/dashboard" replace />

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard"

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 500))
    login(role, values.email)
    toast.success(t("login.welcome", { name: demoUsers[role].name }))
    navigate(from, { replace: true })
  }

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

          <h2 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("login.subtitle")}</p>

          <div
            role="radiogroup"
            aria-label={t("login.role")}
            className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-muted p-1"
          >
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={role === r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  "rounded-md py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  role === r.value
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(r.labelKey)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder={t("login.emailPlaceholder")}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
              {isSubmitting ? t("login.submitting") : t("login.submit")}
            </Button>
          </form>

          <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
            {t("common.backHome")}
          </Link>

          <p className="mt-6 rounded-md border border-dashed bg-accent/50 p-3 text-xs text-muted-foreground">
            {t("login.demo")}
          </p>
        </div>
      </main>
    </div>
  )
}
