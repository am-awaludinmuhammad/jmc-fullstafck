import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth/session";
import { signEmployeeToken } from "@/lib/auth/employee-jwt";

export async function POST() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  const token = signEmployeeToken({ userId: session.user.id, roleId: session.user.roleId });

  return NextResponse.json({ token });
}
