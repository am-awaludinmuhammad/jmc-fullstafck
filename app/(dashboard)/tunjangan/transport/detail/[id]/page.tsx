import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { TransportDetailTable } from "@/components/tunjangan/TransportDetailTable"
import { monthNameID } from "@/lib/format"

export default async function TunjanganTransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const period = await prisma.transportAllowancePeriod.findUnique({ where: { id: Number(id) } })

  if (!period) {
    notFound()
  }

  const details = await prisma.transportAllowanceDetail.findMany({
    where: { transportAllowancePeriodId: period.id },
    include: { employee: true },
    orderBy: { employee: { name: "asc" } },
  })

  return (
    <div className="grid gap-3">
      <h3 className="font-semibold text-lg">
        Bulan {monthNameID(period.periodMonth)} {period.periodYear}
      </h3>

      <TransportDetailTable
        periodId={period.id}
        status={period.status}
        details={details.map((d) => ({
          id: d.id,
          employeeName: d.employee.name,
          roundedKm: Number(d.roundedKm),
          attendanceDays: Number(d.attendanceDays),
          nominal: Number(d.nominal),
        }))}
      />
    </div>
  )
}
