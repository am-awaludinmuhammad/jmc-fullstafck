"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { positions, departments, districts, regencies, provinces } from "@/data/master"
import type { Employee, EmployeeEducation } from "@/data/pegawai"

export function PegawaiForm({ employee }: { employee?: Employee }) {
  const [educations, setEducations] = useState<Partial<EmployeeEducation>[]>(
    employee?.educations && employee.educations.length > 0
      ? employee.educations
      : [{ educationLevel: "", schoolName: "", graduationYear: undefined }]
  )
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    employee?.photoPath ?? null
  )
  const [status, setStatus] = useState(employee ? employee.status === "active" : true)

  const addEducationRow = () => {
    setEducations((prev) => [...prev, { educationLevel: "", schoolName: "", graduationYear: undefined }])
  }

  const removeEducationRow = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Data Diri</h3>
        </div>
        <div className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Foto"
                  width={100}
                  height={100}
                  className="rounded-full object-cover size-25"
                />
              ) : (
                <div className="rounded-full bg-muted size-25" />
              )}
              <Label htmlFor="unggah-foto" className="text-primary cursor-pointer text-sm">
                Ubah Foto
              </Label>
              <input id="unggah-foto" type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </div>

            <div className="flex-1 grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" type="text" defaultValue={employee?.nip} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" type="text" defaultValue={employee?.name} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={employee?.email} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input id="phone" type="text" defaultValue={employee?.phone} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="birthPlace">Tempat Lahir</Label>
              <Input id="birthPlace" type="text" defaultValue={employee?.birthPlace} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="birthDate">Tanggal Lahir</Label>
              <Input id="birthDate" type="date" defaultValue={employee?.birthDate} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="age">Usia</Label>
              <Input id="age" type="number" readOnly />
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg border p-4">
            <Label className="mb-2">Pendidikan</Label>
            <div className="grid gap-2">
              <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 text-sm text-muted-foreground">
                <span>Jenjang</span>
                <span>Nama Sekolah / Perguruan Tinggi</span>
                <span>Tahun Lulus</span>
                <span />
              </div>
              {educations.map((edu, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2 items-center">
                  <Input defaultValue={edu.educationLevel} />
                  <Input defaultValue={edu.schoolName} />
                  <Input type="number" defaultValue={edu.graduationYear} />
                  <button
                    type="button"
                    onClick={() => removeEducationRow(index)}
                    className="text-destructive"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <Button type="button" variant="secondary" onClick={addEducationRow}>
                Tambah Data
              </Button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="fullAddress">Alamat Lengkap</Label>
            <Textarea id="fullAddress" rows={3} defaultValue={employee?.fullAddress} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Kecamatan</Label>
              <Select defaultValue={employee ? String(employee.district.id) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kecamatan">
                    {employee?.district.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Kabupaten</Label>
              <Select defaultValue={employee ? String(employee.regency.id) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kabupaten">
                    {employee?.regency.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {regencies.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Provinsi</Label>
              <Select defaultValue={employee ? String(employee.province.id) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih provinsi">
                    {employee?.province.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Status Pernikahan</Label>
              <RadioGroup defaultValue={employee?.maritalStatus ?? "Belum Menikah"}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Belum Menikah" id="belum-menikah" />
                  <Label htmlFor="belum-menikah" className="font-normal">Belum Menikah</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Menikah" id="menikah" />
                  <Label htmlFor="menikah" className="font-normal">Menikah</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="childrenCount">Jumlah Anak</Label>
              <Input id="childrenCount" type="number" min={0} defaultValue={employee?.childrenCount} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Data Kepegawaian</h3>
        </div>
        <div className="p-4 grid gap-4 flex-1">
          <div className="grid gap-1.5">
            <Label htmlFor="joinedAt">Tanggal Masuk</Label>
            <Input id="joinedAt" type="date" defaultValue={employee?.joinedAt} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Jabatan</Label>
              <Select defaultValue={employee ? String(employee.position.id) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan">
                    {employee?.position.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Departemen</Label>
              <Select defaultValue={employee ? String(employee.department.id) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen">
                    {employee?.department.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <Switch checked={status} onCheckedChange={setStatus} />
              <span className="text-sm">{status ? "Aktif" : "Tidak Aktif"}</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button type="button">Simpan</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/pegawai">Kembali</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
