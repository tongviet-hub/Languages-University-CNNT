import { zodResolver } from "@hookform/resolvers/zod"
import { Cake, IdCard, Mail, MapPin, Monitor, Moon, Phone, Sun } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageHeader } from "@/components/common/page-header"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import type { DictKey } from "@/lib/dictionary"
import { formatDate, initials } from "@/lib/format"
import { useI18n } from "@/lib/i18n"
import { languages } from "@/lib/locale"
import { cn } from "@/lib/utils"

const themes = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
  { value: "system", labelKey: "theme.system", icon: Monitor },
] as const satisfies readonly { value: string; labelKey: DictKey; icon: unknown }[]

const passwordFields = [
  ["current", "prof.current", "current-password"],
  ["next", "prof.new", "new-password"],
  ["confirm", "prof.confirm", "new-password"],
] as const

export default function ProfilePage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t, tr, locale } = useI18n()

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          current: z.string().min(1, t("prof.err.current")),
          next: z.string().min(8, t("prof.err.newMin")).regex(/[0-9]/, t("prof.err.newDigit")),
          confirm: z.string(),
        })
        .refine((v) => v.next === v.confirm, { path: ["confirm"], message: t("prof.err.confirm") }),
    [t]
  )
  type PasswordValues = z.infer<typeof passwordSchema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  if (!user) return null

  const info = [
    { icon: IdCard, label: t(user.role === "student" ? "prof.studentId" : "prof.teacherId"), value: user.studentCode },
    { icon: Mail, label: t("login.email"), value: user.email },
    { icon: Phone, label: t("prof.phone"), value: user.phone },
    { icon: Cake, label: t("prof.birthday"), value: formatDate(user.birthday, locale) },
    { icon: MapPin, label: t("prof.address"), value: tr(user.address) },
  ]

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success(t("prof.updated"))
    reset()
  }

  return (
    <div>
      <PageHeader title={t("nav.profile")} description={t("prof.desc")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center text-center">
            <div className="h-20 w-full rounded-xl bg-gradient-to-r from-primary to-red-400" aria-hidden />
            <Avatar className="-mt-10 size-20 border-4 border-card">
              <AvatarFallback className="bg-accent text-xl font-semibold text-primary">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <p className="mt-3 text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{tr(user.className)}</p>
            <Badge className="mt-3">{t(user.role === "student" ? "role.student" : "role.teacher")}</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("prof.contact")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium break-words">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("prof.password")}</CardTitle>
            <CardDescription>{t("prof.passwordDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-md gap-4" noValidate>
              {passwordFields.map(([name, labelKey, autoComplete]) => (
                <div key={name} className="space-y-1.5">
                  <Label htmlFor={name}>{t(labelKey)}</Label>
                  <Input
                    id={name}
                    type="password"
                    autoComplete={autoComplete}
                    aria-invalid={!!errors[name]}
                    {...register(name)}
                  />
                  {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
                </div>
              ))}
              <Button type="submit" disabled={isSubmitting} className="w-fit">
                {isSubmitting ? t("prof.saving") : t("prof.update")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("prof.appearance")}</CardTitle>
              <CardDescription>{t("prof.appearanceDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {themes.map(({ value, labelKey, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    theme === value ? "border-primary bg-accent text-primary" : "hover:border-primary/40"
                  )}
                >
                  <Icon className="size-5" />
                  {t(labelKey)}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("prof.language")}</CardTitle>
              <CardDescription>{t("prof.languageDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {languages.map(({ value, label, short }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={lang === value}
                  onClick={() => setLang(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    lang === value ? "border-primary bg-accent text-primary" : "hover:border-primary/40"
                  )}
                >
                  <span className="text-base font-semibold">{short}</span>
                  {label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
