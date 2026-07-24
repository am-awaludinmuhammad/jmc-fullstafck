import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorize";

export async function GET(request: NextRequest) {
  const { allowed } = await requirePermission("KELOLA_USER", "access");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const username = request.nextUrl.searchParams.get("username")?.trim() ?? "";
  const excludeUserId = request.nextUrl.searchParams.get("excludeUserId");

  if (!/^[a-z0-9]{6,}$/.test(username)) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  const available = !existing || (excludeUserId ? existing.id === Number(excludeUserId) : false);

  return NextResponse.json({ available });
}
