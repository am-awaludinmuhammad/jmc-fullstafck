import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorize";

export async function POST(request: NextRequest) {
  const { allowed, session } = await requirePermission("SETTING_TUNJANGAN", "create");
  if (!allowed || !session) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const body = await request.json();
  const { baseFare, effectiveStart, minKm, maxKm } = body;

  const baseFareNum = Number(baseFare);
  const minKmNum = Number(minKm);
  const maxKmNum = Number(maxKm);

  if (!baseFareNum || baseFareNum <= 0) {
    return NextResponse.json({ error: "Tarif wajib diisi dan lebih dari 0" }, { status: 400 });
  }

  if (!effectiveStart) {
    return NextResponse.json({ error: "Tanggal berlaku wajib diisi" }, { status: 400 });
  }

  if (!Number.isFinite(minKmNum) || minKmNum < 0) {
    return NextResponse.json({ error: "Minimum kilometer tidak valid" }, { status: 400 });
  }

  if (!Number.isFinite(maxKmNum) || maxKmNum <= minKmNum) {
    return NextResponse.json({ error: "Maksimum kilometer harus lebih besar dari minimum" }, { status: 400 });
  }

  const [, created] = await prisma.$transaction([
    prisma.transportAllowanceSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    }),
    prisma.transportAllowanceSetting.create({
      data: {
        baseFare: baseFareNum,
        effectiveStart: new Date(effectiveStart),
        minKm: minKmNum,
        maxKm: maxKmNum,
        isActive: true,
        createdBy: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ id: created.id }, { status: 201 });
}
