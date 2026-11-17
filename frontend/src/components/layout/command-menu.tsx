import { Languages, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { mainNav, secondaryNav } from "@/components/layout/nav"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const { lang, setLang, t } = useI18n()
  const { logout } = useAuth()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const run = (fn: () => void) => {
    onOpenChange(false)
    fn()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title={t("cmd.title")} description={t("cmd.description")}>
      <CommandInput placeholder={t("cmd.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("cmd.empty")}</CommandEmpty>
        <CommandGroup heading={t("cmd.navigation")}>
          {[...mainNav, ...secondaryNav].map((item) => (
            <CommandItem key={item.to} onSelect={() => run(() => navigate(item.to))}>
              <item.icon />
              {t(item.titleKey)}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("cmd.actions")}>
          <CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            {t("common.toggleTheme")}
          </CommandItem>
          <CommandItem onSelect={() => run(() => setLang(lang === "vi" ? "en" : "vi"))}>
            <Languages />
            {t("common.switchLanguage")}: {lang === "vi" ? "English" : "Tiếng Việt"}
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                void logout().then(() => navigate("/login", { replace: true }))
              })
            }
          >
            <LogOut />
            {t("common.logout")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
