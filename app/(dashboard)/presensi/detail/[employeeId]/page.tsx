import { notFound } from "next/navigation"
import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateID, MONTH_NAMES_ID } from "@/lib/format"

const ATTENDANCE_TYPE_LABEL: Record<string, string> = {
  hadir: "Hadir",
  cuti: "Cuti",
  izin: "Izin",
  unpaid_leave: "Unpaid Leave",
}

export default async function PresensiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const { employeeId } = await params
  const { year, month } = await searchParams

  const periodYear = Number(year)
  const periodMonth = Number(month)

  const employee = await prisma.employee.findFirst({
    where: { id: Number(employeeId), deletedAt: null },
  })

  if (!employee || !periodYear || !periodMonth) {
    notFound()
  }

  const start = new Date(Date.UTC(periodYear, periodMonth - 1, 1))
  const end = new Date(Date.UTC(periodYear, periodMonth, 1))

  const attendances = await prisma.attendance.findMany({
    where: { employeeId: employee.id, attendanceDate: { gte: start, lt: end } },
    orderBy: { attendanceDate: "asc" },
  })

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Detail Presensi {employee.name}</h2>
        <p className="text-sm text-muted-foreground">
          {MONTH_NAMES_ID[periodMonth - 1]} {periodYear}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tgl</TableHead>
            <TableHead>Lokasi Checkin</TableHead>
            <TableHead>Kehadiran</TableHead>
            <TableHead>Durasi (Hadir)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verifikasi</TableHead>
            <TableHead>Verifikator</TableHead>
            <TableHead>Keterangan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                Belum ada data presensi untuk periode ini
              </TableCell>
            </TableRow>
          )}
          {attendances.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{formatDateID(row.attendanceDate)}</TableCell>
              <TableCell>{row.checkinLocation ?? "-"}</TableCell>
              <TableCell>{ATTENDANCE_TYPE_LABEL[row.attendanceType] ?? row.attendanceType}</TableCell>
              <TableCell>{row.durationHours ? Number(row.durationHours).toFixed(1) : "-"}</TableCell>
              <TableCell>{row.status === "terpenuhi" ? "Terpenuhi" : "Tidak Terpenuhi"}</TableCell>
              <TableCell>{row.verificationStatus}</TableCell>
              <TableCell>{row.verifiedByRole ?? "-"}</TableCell>
              <TableCell>{row.remarks ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 border-t flex justify-end">
        <Link
          href={`/presensi?year=${periodYear}&month=${periodMonth}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Kembali
        </Link>
      </div>
    </div>
  )
}
