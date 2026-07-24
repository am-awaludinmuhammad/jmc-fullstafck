import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { buttonVariants } from "@/components/ui/button-variants"
import { dataPegawai } from "@/data/pegawai"
import { formatDateID, calculateAge } from "@/lib/format"

function DataGridItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  )
}

export default async function PegawaiDetailPage({
  params,
}: {
  params: Promise<{ nip: string }>
}) {
  const { nip } = await params
  const employee = dataPegawai.find((item) => item.nip === nip)

  if (!employee) {
    notFound()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Data Diri</h3>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            {employee.photoPath && (
              <Image
                src={employee.photoPath}
                alt={employee.name}
                width={100}
                height={100}
                className="rounded-full object-cover size-25"
              />
            )}
            <div className="grid gap-3">
              <DataGridItem label="NIP">{employee.nip}</DataGridItem>
              <DataGridItem label="Nama Lengkap">{employee.name}</DataGridItem>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DataGridItem label="Email">{employee.email}</DataGridItem>
            <DataGridItem label="Nomor HP">{employee.phone}</DataGridItem>
            <DataGridItem label="Tempat Lahir">{employee.birthPlace}</DataGridItem>
            <DataGridItem label="Tanggal Lahir">{formatDateID(employee.birthDate)}</DataGridItem>
            <DataGridItem label="Usia">{calculateAge(employee.birthDate)} tahun</DataGridItem>
            <DataGridItem label="Pendidikan">
              {employee.educations.map((edu) => (
                <div key={edu.id}>
                  {edu.educationLevel} / {edu.schoolName} / {edu.graduationYear}
                </div>
              ))}
            </DataGridItem>
          </div>

          <DataGridItem label="Alamat Lengkap">{employee.fullAddress}</DataGridItem>

          <div className="grid grid-cols-3 gap-4">
            <DataGridItem label="Kecamatan">{employee.district.name}</DataGridItem>
            <DataGridItem label="Kabupaten">{employee.regency.name}</DataGridItem>
            <DataGridItem label="Provinsi">{employee.province.name}</DataGridItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DataGridItem label="Status Pernikahan">{employee.maritalStatus}</DataGridItem>
            <DataGridItem label="Jumlah Anak">{employee.childrenCount}</DataGridItem>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Data Kepegawaian</h3>
        </div>
        <div className="p-4 grid gap-4 flex-1">
          <DataGridItem label="Tanggal Masuk">{formatDateID(employee.joinedAt)}</DataGridItem>
          <div className="grid grid-cols-2 gap-4">
            <DataGridItem label="Jabatan">{employee.position.name}</DataGridItem>
            <DataGridItem label="Departemen">{employee.department.name}</DataGridItem>
          </div>
          <DataGridItem label="Status">
            {employee.status === "active" ? "Aktif" : "Tidak Aktif"}
          </DataGridItem>
        </div>
        <div className="p-4 border-t flex justify-end">
          <Link href="/pegawai" className={buttonVariants({ variant: "outline" })}>
            Kembali
          </Link>
        </div>
      </div>
    </div>
  )
}
