import { prisma } from "@/lib/prisma"
import { PegawaiTable } from "@/components/pegawai/PegawaiTable"

export default async function PegawaiPage() {
  const [employees, positions] = await Promise.all([
    prisma.employee.findMany({
      where: { deletedAt: null },
      include: { position: true, department: true },
      orderBy: { id: "asc" },
    }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
  ])

  return <PegawaiTable employees={employees} positions={positions} />
}
