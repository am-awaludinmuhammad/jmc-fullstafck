import { prisma } from "@/lib/prisma"
import { PresensiTable } from "@/components/presensi/PresensiTable"

function defaultPeriod() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  if (month === 0) {
    return { year: year - 1, month: 12 }
  }

  return { year, month }
}

export default async function PresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const fallback = defaultPeriod()
  const periodYear = params.year ? Number(params.year) : fallback.year
  const periodMonth = params.month ? Number(params.month) : fallback.month

  const summaries = await prisma.attendanceSummary.findMany({
    where: { periodYear, periodMonth },
    include: { employee: { include: { position: true } } },
    orderBy: { employee: { name: "asc" } },
  })

  return (
    <PresensiTable
      periodYear={periodYear}
      periodMonth={periodMonth}
      summaries={summaries.map((s) => ({
        employeeId: s.employeeId,
        name: s.employee.name,
        position: s.employee.position.name,
        hadir: Number(s.hadir),
        statusHadir: s.statusHadir,
        cuti: Number(s.cuti),
        kuotaCuti: Number(s.kuotaCuti),
        izin: Number(s.izin),
        kuotaIzin: Number(s.kuotaIzin),
        unpaidLeave: Number(s.unpaidLeave),
        kuotaUnpaidLeave: Number(s.kuotaUnpaidLeave),
      }))}
    />
  )
}
