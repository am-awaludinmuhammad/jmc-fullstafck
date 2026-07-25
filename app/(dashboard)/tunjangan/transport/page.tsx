import { prisma } from "@/lib/prisma"
import { TransportPeriodTable } from "@/components/tunjangan/TransportPeriodTable"

export default async function TunjanganTransportPage() {
  const now = new Date()

  await prisma.transportAllowancePeriod.upsert({
    where: {
      periodYear_periodMonth: {
        periodYear: now.getFullYear(),
        periodMonth: now.getMonth() + 1,
      },
    },
    update: {},
    create: {
      periodYear: now.getFullYear(),
      periodMonth: now.getMonth() + 1,
      totalRecipients: 0,
      totalAmount: 0,
      status: "draft",
    },
  })

  const periods = await prisma.transportAllowancePeriod.findMany({
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  })

  return (
    <TransportPeriodTable
      periods={periods.map((p) => ({
        id: p.id,
        periodYear: p.periodYear,
        periodMonth: p.periodMonth,
        totalRecipients: p.totalRecipients,
        totalAmount: Number(p.totalAmount),
      }))}
    />
  )
}
