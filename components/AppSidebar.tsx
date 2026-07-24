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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { menuItems } from "@/constants/menu"
import { APP_NAME } from "@/lib/env"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
              {menuItems.map((item) => {
                if (item.children) {
                  const isParentActive = item.children.some((child) =>
                    isActivePath(pathname, child.url)
                  );

                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={isParentActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "text-slate-300 hover:bg-brand-600 hover:text-white py-5",
                              isParentActive && "bg-brand-500 text-white hover:bg-brand-500"
                            )}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const isActive = isActivePath(pathname, child.url);
                              return (
                                <SidebarMenuSubItem key={child.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={cn(
                                      "text-slate-400 hover:bg-transparent hover:text-white",
                                      isActive && "bg-transparent text-white hover:bg-transparent"
                                    )}
                                  >
                                    <Link href={child.url}>
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const isActive = isActivePath(pathname, item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="text-slate-300 hover:bg-brand-600 hover:text-white py-5">
                      <Link href={item.url ?? "#"}
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
