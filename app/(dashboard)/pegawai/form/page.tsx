import { prisma } from "@/lib/prisma"
import { PegawaiForm } from "@/components/pegawai/PegawaiForm"

export default async function TambahPegawaiPage() {
  const [positions, departments] = await Promise.all([
    prisma.position.findMany({ orderBy: { name: "asc" } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ])

  return <PegawaiForm positions={positions} departments={departments} />
}
