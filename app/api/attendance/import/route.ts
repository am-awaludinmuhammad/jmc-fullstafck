import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/authorize";
import { parseAttendanceWorkbook } from "@/lib/attendance/excel";
import { recomputeAttendanceSummary } from "@/lib/attendance/summary";
import { calculateHadirRow } from "@/lib/attendance/calculate";
import { GEDUNG_LIST } from "@/lib/attendance/constants";

const ATTENDANCE_TYPES = ["hadir", "cuti", "izin", "unpaid_leave"];
const VERIFICATION_VALUES = ["Disetujui", "Ditolak"];

export async function POST(request: NextRequest) {
  const { allowed, session } = await requirePermission("PRESENSI", "create");
  if (!allowed || !session) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File excel wajib diupload" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsedRows = parseAttendanceWorkbook(buffer);

  if (parsedRows.length === 0) {
    return NextResponse.json({ error: "File excel kosong atau format tidak sesuai template" }, { status: 400 });
  }

  const firstDate = new Date(`${parsedRows[0].date}T00:00:00Z`);
  const periodYear = firstDate.getUTCFullYear();
  const periodMonth = firstDate.getUTCMonth() + 1;

  const attendanceImport = await prisma.attendanceImport.create({
    data: {
      userId: session.user.id,
      originalFilename: file.name,
      periodYear,
      periodMonth,
      status: "processing",
      totalRows: parsedRows.length,
      processedRows: 0,
      startedAt: new Date(),
    },
  });

  const employees = await prisma.employee.findMany({ where: { deletedAt: null } });
  const employeeByNip = new Map(employees.map((e) => [e.nip, e]));

  const errors: { row: number; message: string }[] = [];
  let processedRows = 0;
  const affectedEmployees = new Set<number>();

  for (const row of parsedRows) {
    const employee = employeeByNip.get(row.nip);
    if (!employee) {
      errors.push({ row: row.rowNumber, message: `NIP ${row.nip} tidak ditemukan` });
      continue;
    }

    const rowDate = new Date(`${row.date}T00:00:00Z`);
    if (Number.isNaN(rowDate.getTime()) || rowDate.getUTCFullYear() !== periodYear || rowDate.getUTCMonth() + 1 !== periodMonth) {
      errors.push({ row: row.rowNumber, message: "Tanggal tidak valid atau beda bulan dengan baris pertama" });
      continue;
    }

    if (!ATTENDANCE_TYPES.includes(row.type)) {
      errors.push({ row: row.rowNumber, message: `Jenis "${row.type}" tidak dikenali` });
      continue;
    }

    const verification = VERIFICATION_VALUES.includes(row.verification) ? row.verification : "Disetujui";

    if (row.type === "hadir") {
      if (!GEDUNG_LIST.includes(row.checkinLocation as (typeof GEDUNG_LIST)[number])) {
        errors.push({ row: row.rowNumber, message: `Lokasi checkin "${row.checkinLocation}" tidak dikenali` });
        continue;
      }
      if (!GEDUNG_LIST.includes(row.checkoutLocation as (typeof GEDUNG_LIST)[number])) {
        errors.push({ row: row.rowNumber, message: `Lokasi checkout "${row.checkoutLocation}" tidak dikenali` });
        continue;
      }
      if (!/^\d{2}:\d{2}$/.test(row.checkinTime) || !/^\d{2}:\d{2}$/.test(row.checkoutTime)) {
        errors.push({ row: row.rowNumber, message: "Jam checkin/checkout tidak valid" });
        continue;
      }

      const checkinAt = new Date(`${row.date}T${row.checkinTime}:00Z`);
      const checkoutAt = new Date(`${row.date}T${row.checkoutTime}:00Z`);

      const result = calculateHadirRow({
        checkinAt,
        checkoutAt,
        checkinLocation: row.checkinLocation,
        checkoutLocation: row.checkoutLocation,
      });

      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          attendanceImportId: attendanceImport.id,
          attendanceDate: rowDate,
          checkinAt,
          checkoutAt,
          checkinLocation: row.checkinLocation,
          checkoutLocation: row.checkoutLocation,
          attendanceType: "hadir",
          durationHours: result.durationHours,
          status: result.status,
          verificationStatus: verification,
          verifiedByRole: row.verifiedByRole || null,
          remarks: row.remarks ? row.remarks : result.note,
        },
      });
    } else {
      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          attendanceImportId: attendanceImport.id,
          attendanceDate: rowDate,
          attendanceType: row.type as "cuti" | "izin" | "unpaid_leave",
          status: "terpenuhi",
          verificationStatus: verification,
          verifiedByRole: row.verifiedByRole || null,
          remarks: row.remarks || null,
        },
      });
    }

    affectedEmployees.add(employee.id);
    processedRows += 1;
  }

  for (const employeeId of affectedEmployees) {
    await recomputeAttendanceSummary(employeeId, periodYear, periodMonth);
  }

  const finalStatus = processedRows === 0 ? "failed" : "completed";

  await prisma.attendanceImport.update({
    where: { id: attendanceImport.id },
    data: {
      status: finalStatus,
      processedRows,
      finishedAt: new Date(),
      errorMessage: errors.length > 0 ? errors.map((e) => `Baris ${e.row}: ${e.message}`).join("; ") : null,
    },
  });

  return NextResponse.json({
    importId: attendanceImport.id,
    periodYear,
    periodMonth,
    totalRows: parsedRows.length,
    processedRows,
    errors,
    status: finalStatus,
  });
}
