import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return NextResponse.json([]);
  }

  const districts = await prisma.district.findMany({
    where: { name: { contains: q } },
    include: { regency: { include: { province: true } } },
    take: 20,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    districts.map((d) => ({
      id: d.id,
      name: d.name,
      regency: { id: d.regency.id, name: d.regency.name },
      province: { id: d.regency.province.id, name: d.regency.province.name },
    }))
  );
}
