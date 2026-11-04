import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const programOptions = ["Ngôn ngữ Anh", "Ngôn ngữ Nhật", "Ngôn ngữ Hàn Quốc", "Ngôn ngữ Trung Quốc", "Ngôn ngữ Pháp", "Ngôn ngữ Đức"]

const schema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ và tên"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+84|0)[0-9 ]{8,12}$/, "Số điện thoại chưa hợp lệ, ví dụ 0912 345 678"),
  program: z.string().min(1, "Vui lòng chọn ngành quan tâm"),
  note: z.string().max(300, "Tối đa 300 ký tự").optional(),
})
type FormValues = z.infer<typeof schema>

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  )
}

export function ConsultForm({ className }: { className?: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { program: "" } })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Đã nhận đăng ký. Phòng Tuyển sinh sẽ gọi lại trong 24 giờ.")
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="consult-name">Họ và tên</Label>
        <Input
          id="consult-name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "consult-name-error" : undefined}
          {...register("name")}
        />
        <FieldError id="consult-name-error" message={errors.name?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-phone">Số điện thoại</Label>
        <Input
          id="consult-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "consult-phone-error" : undefined}
          {...register("phone")}
        />
        <FieldError id="consult-phone-error" message={errors.phone?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-program">Ngành quan tâm</Label>
        <select
          id="consult-program"
          className={selectClass}
          aria-invalid={!!errors.program}
          aria-describedby={errors.program ? "consult-program-error" : undefined}
          {...register("program")}
        >
          <option value="">Chọn một ngành</option>
          {programOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <FieldError id="consult-program-error" message={errors.program?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-note">Lời nhắn (không bắt buộc)</Label>
        <Textarea
          id="consult-note"
          rows={3}
          aria-invalid={!!errors.note}
          aria-describedby={errors.note ? "consult-note-error" : undefined}
          {...register("note")}
        />
        <FieldError id="consult-note-error" message={errors.note?.message} />
      </div>

      <Button type="submit" size="lg" className="h-11 text-base" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi đăng ký tư vấn"}
      </Button>
    </form>
  )
}
