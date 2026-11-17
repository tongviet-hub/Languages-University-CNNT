import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiRequestError } from "@/lib/api-client"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

export default function LoginPage() {
  const { user, login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("login.err.emailRequired")).email(t("login.err.emailInvalid")),
        password: z.string().min(1, t("login.err.passwordRequired")),
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
    defaultValues: { email: "", password: "" },
  })

  if (user) return <Navigate to="/dashboard" replace />

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard"

  const onSubmit = async (values: FormValues) => {
    try {
      const me = await login(values.email, values.password)
      toast.success(t("login.welcome", { name: me.name }))
      navigate(from, { replace: true })
    } catch (err) {
      // Backend trả thông báo tiếng Việt sẵn (sai mật khẩu, đăng nhập quá nhiều lần...)
      toast.error(err instanceof ApiRequestError && err.status !== 0 ? err.message : t("login.err.network"))
    }
  }

  return (
    <AuthShell title={t("login.title")} subtitle={t("login.subtitle")}>
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

      <p className="mt-4 text-sm text-muted-foreground">
        {t("login.noAccount")}{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          {t("register.link")}
        </Link>
      </p>

      <Link to="/" className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground">
        {t("common.backHome")}
      </Link>

      <p className="mt-6 rounded-md border border-dashed bg-accent/50 p-3 text-xs text-muted-foreground">
        {t("login.demo")}
      </p>
    </AuthShell>
  )
}
