import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { ApiRequestError } from "@/lib/api-client"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

/**
 * Sinh viên tự tạo tài khoản. Backend luôn tạo vai trò "student"
 * (tài khoản giảng viên/admin do admin tạo). Đăng ký xong là đăng nhập luôn.
 */
export default function RegisterPage() {
  const { user, register: signUp } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  // Quy tắc giống hệt backend (RegisterDto) để báo lỗi ngay, không phải chờ gửi lên server
  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().trim().min(2, t("register.err.nameMin")).max(120, t("register.err.nameMax")),
          email: z.string().min(1, t("login.err.emailRequired")).email(t("login.err.emailInvalid")).max(255),
          password: z
            .string()
            .min(8, t("register.err.passwordMin"))
            .max(72, t("register.err.passwordMax"))
            .regex(/(?=.*[A-Za-z])(?=.*\d)/, t("prof.err.newDigit")),
          confirm: z.string(),
        })
        .refine((v) => v.password === v.confirm, { path: ["confirm"], message: t("prof.err.confirm") }),
    [t]
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", confirm: "" },
  })

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (values: FormValues) => {
    try {
      const me = await signUp(values.email, values.password, values.fullName.trim())
      toast.success(t("register.success", { name: me.name }))
      navigate("/dashboard", { replace: true })
    } catch (err) {
      // vd 409 "Email đã được sử dụng", 429 đăng ký quá nhiều lần
      toast.error(err instanceof ApiRequestError && err.status !== 0 ? err.message : t("login.err.network"))
    }
  }

  const fields = [
    { name: "fullName", label: t("register.fullName"), type: "text", autoComplete: "name", placeholder: t("register.fullNamePlaceholder") },
    { name: "email", label: t("login.email"), type: "email", autoComplete: "email", placeholder: t("login.emailPlaceholder") },
    { name: "password", label: t("login.password"), type: "password", autoComplete: "new-password", placeholder: "" },
    { name: "confirm", label: t("register.confirm"), type: "password", autoComplete: "new-password", placeholder: "" },
  ] as const

  return (
    <AuthShell title={t("register.title")} subtitle={t("register.subtitle")}>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>{f.label}</Label>
            {f.type === "password" ? (
              <PasswordInput
                id={f.name}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                aria-invalid={!!errors[f.name]}
                {...register(f.name)}
              />
            ) : (
              <Input
                id={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                aria-invalid={!!errors[f.name]}
                {...register(f.name)}
              />
            )}
            {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]?.message}</p>}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{t("register.passwordHint")}</p>
        <Button type="submit" size="lg" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        {t("register.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          {t("login.submit")}
        </Link>
      </p>

      <Link to="/" className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground">
        {t("common.backHome")}
      </Link>
    </AuthShell>
  )
}
