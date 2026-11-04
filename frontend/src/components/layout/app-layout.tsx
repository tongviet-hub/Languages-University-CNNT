import { useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { CommandMenu } from "@/components/layout/command-menu"
import { Topbar } from "@/components/layout/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  )
}
