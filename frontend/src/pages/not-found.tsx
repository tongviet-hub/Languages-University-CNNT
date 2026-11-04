import { Home } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export default function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-7xl font-bold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold">{t("nf.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("nf.desc")}</p>
      <Button className="mt-6" nativeButton={false} render={<Link to="/" />}>
        <Home /> {t("nf.home")}
      </Button>
    </div>
  )
}
