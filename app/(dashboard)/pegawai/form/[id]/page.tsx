import { notFound } from "next/navigation"

import { PegawaiForm } from "@/components/pegawai/PegawaiForm"
import { prisma } from "@/lib/prisma"

export default async function EditPegawaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [employee, positions, departments] = await Promise.all([
    prisma.employee.findFirst({
      where: { nip: id, deletedAt: null },
      include: {
        educations: { orderBy: { sortOrder: "asc" } },
        district: { include: { regency: { include: { province: true } } } },
      },
    }),
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!employee) {
    notFound()
  }

  return (
    <PegawaiForm
      employee={{ ...employee, distanceKm: Number(employee.distanceKm) }}
      positions={positions}
      departments={departments}
    />
  )
}
