import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { verifySession } from "@/lib/auth/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
