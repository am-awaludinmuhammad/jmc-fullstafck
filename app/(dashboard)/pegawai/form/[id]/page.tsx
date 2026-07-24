import { notFound } from "next/navigation"

import { PegawaiForm } from "@/components/pegawai/PegawaiForm"
import { dataPegawai } from "@/data/pegawai"

export default async function EditPegawaiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const employee = dataPegawai.find((item) => item.nip === id)

  if (!employee) {
    notFound()
  }

  return <PegawaiForm employee={employee} />
}
