import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorize";
import { calculateTunjanganTransport } from "@/lib/tunjangan/calculate";

export async function POST(request: NextRequest, { params }: { params: Promise<{ periodId: string }> }) {
  const { allowed, session } = await requirePermission("TUNJANGAN_TRANSPORT", "access");
  if (!allowed || !session) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const { periodId } = await params;
  const period = await prisma.transportAllowancePeriod.findUnique({ where: { id: Number(periodId) } });

  if (!period) {
    return NextResponse.json({ error: "Periode tidak ditemukan" }, { status: 404 });
  }

  const periodStart = new Date(Date.UTC(period.periodYear, period.periodMonth - 1, 1));

  const setting = await prisma.transportAllowanceSetting.findFirst({
    where: { effectiveStart: { lte: periodStart } },
    orderBy: { effectiveStart: "desc" },
  });

  if (!setting) {
    return NextResponse.json({ error: "Belum ada setting tunjangan yang berlaku untuk periode ini" }, { status: 400 });
  }

  const summaries = await prisma.attendanceSummary.findMany({
    where: { periodYear: period.periodYear, periodMonth: period.periodMonth },
    include: { employee: true },
  });

  const baseFare = Number(setting.baseFare);
  const minKm = Number(setting.minKm);
  const maxKm = Number(setting.maxKm);

  const eligibleDetails = summaries
    .filter((summary) => summary.employee.deletedAt === null)
    .map((summary) => {
      const result = calculateTunjanganTransport({
        employmentType: summary.employee.employmentType,
        distanceKm: Number(summary.employee.distanceKm),
        hadir: Number(summary.hadir),
        baseFare,
        minKm,
        maxKm,
      });

      if (!result.eligible) return null;

      return {
        employeeId: summary.employeeId,
        baseFare,
        originalKm: result.originalKm,
        roundedKm: result.roundedKm,
        attendanceDays: Number(summary.hadir),
        nominal: result.nominal,
        eligibilityStatus: "Eligible",
      };
    })
    .filter((detail) => detail !== null);

  const totalAmount = eligibleDetails.reduce((sum, detail) => sum + detail.nominal, 0);

  await prisma.$transaction([
    prisma.transportAllowanceDetail.deleteMany({ where: { transportAllowancePeriodId: period.id } }),
    prisma.transportAllowanceDetail.createMany({
      data: eligibleDetails.map((detail) => ({
        transportAllowancePeriodId: period.id,
        ...detail,
      })),
    }),
    prisma.transportAllowancePeriod.update({
      where: { id: period.id },
      data: {
        totalRecipients: eligibleDetails.length,
        totalAmount,
        status: "calculated",
        calculatedBy: session.user.id,
        calculatedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ totalRecipients: eligibleDetails.length, totalAmount });
}
