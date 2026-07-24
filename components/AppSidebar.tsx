"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { APP_NAME } from "@/lib/env"
import { LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
]

export const isActivePath = (pathname?: string, href?: string) => {
  const strip = (s: string) => (s ? s.replace(/\/+$/, "") : "");
  const p = strip(pathname ?? "") || "/";
  const h = strip(href ?? "") || "/";

  if (h === "/") {
    return p === "/";
  }

  return p === h || p.startsWith(h + "/");
};


export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarHeader className="my-3 text-white">
        <div className="flex gap-2 items-center mx-2 justify-center">
          <Image src="/logo/logo_jmc.png" height={10} width={40} alt="logo" />
          <h2 className="font-bold">{APP_NAME}</h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="mx-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = isActivePath(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="hover:bg-brand-600 hover:text-white py-5">
                      <Link href={item.url}
                        className={cn(
                          "flex items-center",
                          isActive &&
                          "bg-brand-500 text-white"
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
