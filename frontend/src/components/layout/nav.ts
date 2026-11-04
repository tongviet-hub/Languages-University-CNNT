import {
  Bell,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import type { DictKey } from "@/lib/dictionary"

export interface NavItem {
  titleKey: DictKey
  to: string
  icon: LucideIcon
}

export const mainNav: NavItem[] = [
  { titleKey: "nav.dashboard", to: "/dashboard", icon: LayoutDashboard },
  { titleKey: "nav.schedule", to: "/schedule", icon: CalendarDays },
  { titleKey: "nav.grades", to: "/grades", icon: GraduationCap },
  { titleKey: "nav.attendance", to: "/attendance", icon: CalendarCheck },
]

export const secondaryNav: NavItem[] = [
  { titleKey: "nav.announcements", to: "/announcements", icon: Bell },
  { titleKey: "nav.profile", to: "/profile", icon: UserRound },
]
