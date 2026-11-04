import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { languages } from "@/lib/locale"

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  const current = languages.find((l) => l.value === lang)!
  const next = languages.find((l) => l.value !== lang)!

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      aria-label={`${t("common.switchLanguage")}: ${next.label}`}
      title={next.label}
      onClick={() => setLang(next.value)}
    >
      <Languages className="size-4" />
      <span className="text-xs font-semibold">{current.short}</span>
    </Button>
  )
}
