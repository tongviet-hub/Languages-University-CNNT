import { GraduationCap, LogOut } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import { useAnnouncements } from "@/api/queries"
import { mainNav, secondaryNav, type NavItem } from "@/components/layout/nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"
import { brand } from "@/lib/brand"
import { initials } from "@/lib/format"
import { useI18n } from "@/lib/i18n"

function NavGroup({ label, items, unread = 0 }: { label: string; items: NavItem[]; unread?: number }) {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={t(item.titleKey)}
                  render={<NavLink to={item.to} onClick={() => isMobile && setOpenMobile(false)} />}
                  className="data-active:bg-primary data-active:text-primary-foreground data-active:shadow-sm data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"
                >
                  <item.icon />
                  <span>{t(item.titleKey)}</span>
                </SidebarMenuButton>
                {item.to === "/announcements" && unread > 0 && (
                  <SidebarMenuBadge className="rounded-full bg-primary/10 text-primary">{unread}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { t, tr } = useI18n()
  const navigate = useNavigate()
  const { data: announcements } = useAnnouncements()
  const unread = announcements?.filter((a) => !a.read).length ?? 0

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">{tr(brand.portalName)}</span>
            <span className="text-xs text-muted-foreground">{tr(brand.shortName)}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label={t("nav.group.study")} items={mainNav} />
        <NavGroup label={t("nav.group.personal")} items={secondaryNav} unread={unread} />
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-2 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <Avatar>
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {user ? initials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user ? tr(user.className) : ""}</span>
          </div>
          <button
            type="button"
            aria-label={t("common.logout")}
            onClick={() => {
              void logout().then(() => navigate("/login", { replace: true }))
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
