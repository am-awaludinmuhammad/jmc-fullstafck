import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Root Layout */}
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main + Right Sidebar */}
        <div className="flex flex-1 h-full transition-[width] duration-300 min-w-0">
          {/* Main Content Section */}
          <div
            className={cn(
              "flex flex-col flex-1 transition-all duration-300 min-w-0",
            )}
          >
            {/* Header */}
            <header className="h-14 border-b bg-background flex justify-between items-center px-4 lg:px-5 shrink-0">
              <div>
                <SidebarTrigger />
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-auto p-4 lg:p-5 min-w-0">
              {/* Content Wrapper */}
              <div className="space-y-4 lg:space-y-5 w-full min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
