import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorize";

export async function GET(request: NextRequest) {
  const { allowed } = await requirePermission("KELOLA_USER", "access");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const excludeUserId = request.nextUrl.searchParams.get("excludeUserId");

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const employees = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      name: { contains: q },
      OR: [
        { user: null },
        ...(excludeUserId ? [{ user: { id: Number(excludeUserId) } }] : []),
      ],
    },
    include: { position: true, department: true },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    employees.map((e) => ({
      id: e.id,
      name: e.name,
      nip: e.nip,
      position: { id: e.position.id, name: e.position.name },
      department: { id: e.department.id, name: e.department.name },
    }))
  );
}
