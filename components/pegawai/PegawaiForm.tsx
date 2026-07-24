"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

import { calculateAge } from "@/lib/format"
import { getEmployeeToken } from "@/lib/employees/client-auth"

type Option = { id: number; name: string }

type EmployeeEducation = {
  id?: number
  educationLevel: string
  schoolName: string
  graduationYear: number | ""
}

type EmployeeWithRelations = {
  id: number
  nip: string
  name: string
  email: string
  phone: string
  photoPath: string | null
  birthPlace: string
  birthDate: Date
  maritalStatus: string
  childrenCount: number
  joinedAt: Date
  positionId: number
  departmentId: number
  employmentType: "pkwtt" | "pkwt" | "magang"
  gender: string
  distanceKm: number
  districtId: number
  fullAddress: string
  status: "active" | "inactive"
  educations: EmployeeEducation[]
  district: { id: number; name: string; regency: { id: number; name: string; province: { id: number; name: string } } }
}

type DistrictOption = {
  id: number
  name: string
  regency: { id: number; name: string }
  province: { id: number; name: string }
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function PegawaiForm({
  employee,
  positions,
  departments,
}: {
  employee?: EmployeeWithRelations
  positions: Option[]
  departments: Option[]
}) {
  const router = useRouter()
  const isEdit = Boolean(employee)

  const [educations, setEducations] = useState<EmployeeEducation[]>(
    employee && employee.educations.length > 0
      ? employee.educations
      : [{ educationLevel: "", schoolName: "", graduationYear: "" }]
  )
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee?.photoPath ?? null)
  const [status, setStatus] = useState(employee ? employee.status === "active" : true)

  const [nip, setNip] = useState(employee?.nip ?? "")
  const [name, setName] = useState(employee?.name ?? "")
  const [email, setEmail] = useState(employee?.email ?? "")
  const [phone, setPhone] = useState(employee?.phone ?? "")
  const [birthPlace, setBirthPlace] = useState(employee?.birthPlace ?? "")
  const [birthDate, setBirthDate] = useState(employee ? toDateInputValue(employee.birthDate) : "")
  const [fullAddress, setFullAddress] = useState(employee?.fullAddress ?? "")
  const [maritalStatus, setMaritalStatus] = useState(employee?.maritalStatus ?? "tidak kawin")
  const [childrenCount, setChildrenCount] = useState(employee ? String(employee.childrenCount) : "0")
  const [joinedAt, setJoinedAt] = useState(employee ? toDateInputValue(employee.joinedAt) : "")
  const [positionId, setPositionId] = useState(employee ? String(employee.positionId) : "")
  const [departmentId, setDepartmentId] = useState(employee ? String(employee.departmentId) : "")
  const [employmentType, setEmploymentType] = useState(employee?.employmentType ?? "pkwt")
  const [gender, setGender] = useState(employee?.gender ?? "Laki-laki")
  const [distanceKm, setDistanceKm] = useState(employee ? String(employee.distanceKm) : "")

  const [districtQuery, setDistrictQuery] = useState(employee?.district.name ?? "")
  const [districtId, setDistrictId] = useState<number | null>(employee?.districtId ?? null)
  const [regencyName, setRegencyName] = useState(employee?.district.regency.name ?? "")
  const [provinceName, setProvinceName] = useState(employee?.district.regency.province.name ?? "")
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([])
  const [districtOpen, setDistrictOpen] = useState(false)

  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const age = birthDate ? calculateAge(birthDate) : ""

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (districtQuery.length < 3 || (districtId && districtQuery === employee?.district.name)) {
        setDistrictOptions([])
        return
      }

      const response = await fetch(`/api/wilayah/districts?q=${encodeURIComponent(districtQuery)}`)
      if (response.ok) {
        setDistrictOptions(await response.json())
      }
    }, 300)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtQuery])

  function selectDistrict(option: DistrictOption) {
    setDistrictId(option.id)
    setDistrictQuery(option.name)
    setRegencyName(option.regency.name)
    setProvinceName(option.province.name)
    setDistrictOpen(false)
    setDistrictOptions([])
  }

  function addEducationRow() {
    setEducations((prev) => [...prev, { educationLevel: "", schoolName: "", graduationYear: "" }])
  }

  function removeEducationRow(index: number) {
    setEducations((prev) => prev.filter((_, i) => i !== index))
  }

  function updateEducation(index: number, field: keyof EmployeeEducation, value: string) {
    setEducations((prev) =>
      prev.map((edu, i) =>
        i === index
          ? { ...edu, [field]: field === "graduationYear" ? (value ? Number(value) : "") : value }
          : edu
      )
    )
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSave() {
    if (!districtId) {
      setError("Kecamatan wajib dipilih")
      return
    }

    setSaving(true)
    setError("")

    try {
      const token = await getEmployeeToken()

      const formData = new FormData()
      formData.set("nip", nip)
      formData.set("name", name)
      formData.set("email", email)
      formData.set("phone", phone)
      formData.set("birthPlace", birthPlace)
      formData.set("birthDate", birthDate)
      formData.set("maritalStatus", maritalStatus)
      formData.set("childrenCount", childrenCount)
      formData.set("joinedAt", joinedAt)
      formData.set("positionId", positionId)
      formData.set("departmentId", departmentId)
      formData.set("employmentType", employmentType)
      formData.set("gender", gender)
      formData.set("distanceKm", distanceKm)
      formData.set("districtId", String(districtId))
      formData.set("fullAddress", fullAddress)
      formData.set("status", status ? "active" : "inactive")
      formData.set(
        "educations",
        JSON.stringify(
          educations
            .filter((edu) => edu.educationLevel && edu.schoolName && edu.graduationYear)
            .map((edu) => ({
              educationLevel: edu.educationLevel,
              schoolName: edu.schoolName,
              graduationYear: Number(edu.graduationYear),
            }))
        )
      )
      if (photoFile) {
        formData.set("photo", photoFile)
      }

      const response = await fetch(isEdit ? `/api/employees/${employee!.id}` : "/api/employees", {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? "Gagal menyimpan data")
        return
      }

      router.push("/pegawai")
      router.refresh()
    } finally {
      setSaving(false)
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
                  unoptimized
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
              <input id="unggah-foto" type="file" accept="image/png,image/jpeg" hidden onChange={handlePhotoChange} />
            </div>

            <div className="flex-1 grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="nip">NIP</Label>
                <Input id="nip" type="text" value={nip} onChange={(e) => setNip(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="text"
                placeholder="+6282218458888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Jenis Kelamin</Label>
              <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Laki-laki" id="laki-laki" />
                  <Label htmlFor="laki-laki" className="font-normal">Laki-laki</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Perempuan" id="perempuan" />
                  <Label htmlFor="perempuan" className="font-normal">Perempuan</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="birthPlace">Tempat Lahir</Label>
              <Input id="birthPlace" type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
            </div>
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="birthDate">Tanggal Lahir</Label>
              <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="age">Usia</Label>
              <Input id="age" type="number" value={age} readOnly disabled />
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
                  <Input
                    value={edu.educationLevel}
                    onChange={(e) => updateEducation(index, "educationLevel", e.target.value)}
                  />
                  <Input
                    value={edu.schoolName}
                    onChange={(e) => updateEducation(index, "schoolName", e.target.value)}
                  />
                  <Input
                    type="number"
                    value={edu.graduationYear}
                    onChange={(e) => updateEducation(index, "graduationYear", e.target.value)}
                  />
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
            <Textarea id="fullAddress" rows={3} value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5 relative">
              <Label htmlFor="district">Kecamatan</Label>
              <Input
                id="district"
                type="text"
                autoComplete="off"
                placeholder="Ketik minimal 3 huruf"
                value={districtQuery}
                onChange={(e) => {
                  setDistrictQuery(e.target.value)
                  setDistrictId(null)
                  setRegencyName("")
                  setProvinceName("")
                  setDistrictOpen(true)
                }}
                onFocus={() => setDistrictOpen(true)}
              />
              {districtOpen && districtOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-auto">
                  {districtOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => selectDistrict(option)}
                    >
                      {option.name}, {option.regency.name}, {option.province.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="regency">Kabupaten</Label>
              <Input id="regency" type="text" value={regencyName} readOnly disabled />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="province">Provinsi</Label>
              <Input id="province" type="text" value={provinceName} readOnly disabled />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Status Kawin</Label>
              <RadioGroup value={maritalStatus} onValueChange={setMaritalStatus}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="tidak kawin" id="tidak-kawin" />
                  <Label htmlFor="tidak-kawin" className="font-normal">Tidak Kawin</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="kawin" id="kawin" />
                  <Label htmlFor="kawin" className="font-normal">Kawin</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="childrenCount">Jumlah Anak</Label>
              <Input
                id="childrenCount"
                type="number"
                min={0}
                max={99}
                value={childrenCount}
                onChange={(e) => setChildrenCount(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="distanceKm">Jarak Rumah - Kantor (km)</Label>
              <Input
                id="distanceKm"
                type="number"
                min={0}
                max={99}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
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
            <Input id="joinedAt" type="date" value={joinedAt} onChange={(e) => setJoinedAt(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Jabatan</Label>
              <Select value={positionId} onValueChange={setPositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan" />
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
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen" />
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
            <Label>Status Kontrak</Label>
            <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as typeof employmentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pkwtt">PKWTT</SelectItem>
                <SelectItem value="pkwt">PKWT</SelectItem>
                <SelectItem value="magang">Magang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <Switch checked={status} onCheckedChange={setStatus} />
              <span className="text-sm">{status ? "Aktif" : "Tidak Aktif"}</span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/pegawai">Kembali</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
