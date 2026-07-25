import "server-only";

import { prisma } from "@/lib/prisma";
import { calculateHadirRow, statusHadirBulan } from "@/lib/attendance/calculate";
import {
  KUOTA_CUTI_PER_BULAN,
  KUOTA_IZIN_PER_BULAN,
  KUOTA_UNPAID_LEAVE_PER_BULAN,
} from "@/lib/attendance/constants";

export async function recomputeAttendanceSummary(employeeId: number, periodYear: number, periodMonth: number) {
  const start = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
  const end = new Date(Date.UTC(periodYear, periodMonth, 1));

  const rows = await prisma.attendance.findMany({
    where: { employeeId, attendanceDate: { gte: start, lt: end } },
  });

  let hadir = 0;
  let cuti = 0;
  let izin = 0;
  let unpaidLeave = 0;

  for (const row of rows) {
    if (row.attendanceType === "hadir" && row.checkinAt && row.checkoutAt && row.checkinLocation && row.checkoutLocation) {
      const result = calculateHadirRow({
        checkinAt: row.checkinAt,
        checkoutAt: row.checkoutAt,
        checkinLocation: row.checkinLocation,
        checkoutLocation: row.checkoutLocation,
      });
      hadir += result.hadirCredit;
    } else if (row.attendanceType === "cuti") {
      cuti += 1;
    } else if (row.attendanceType === "izin") {
      izin += 1;
    } else if (row.attendanceType === "unpaid_leave") {
      unpaidLeave += 1;
    }
  }

  await prisma.attendanceSummary.upsert({
    where: { employeeId_periodYear_periodMonth: { employeeId, periodYear, periodMonth } },
    update: {
      hadir,
      cuti,
      izin,
      unpaidLeave,
      kuotaCuti: KUOTA_CUTI_PER_BULAN,
      kuotaIzin: KUOTA_IZIN_PER_BULAN,
      kuotaUnpaidLeave: KUOTA_UNPAID_LEAVE_PER_BULAN,
      statusHadir: statusHadirBulan(hadir),
      calculatedAt: new Date(),
    },
    create: {
      employeeId,
      periodYear,
      periodMonth,
      hadir,
      cuti,
      izin,
      unpaidLeave,
      kuotaCuti: KUOTA_CUTI_PER_BULAN,
      kuotaIzin: KUOTA_IZIN_PER_BULAN,
      kuotaUnpaidLeave: KUOTA_UNPAID_LEAVE_PER_BULAN,
      statusHadir: statusHadirBulan(hadir),
      calculatedAt: new Date(),
    },
  });
}
