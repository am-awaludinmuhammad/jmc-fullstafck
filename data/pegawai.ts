// Mock data shaped after the `Employee` model (+ joined Position/Department/
// District) in prisma/schema.prisma. Static for now — will be replaced by a
// Prisma query once the backend is wired up.

import { positions, departments, districts, regencies, provinces } from "./master"

export type EmploymentType = "pkwtt" | "pkwt" | "magang"
export type MaritalStatus = "Belum Menikah" | "Menikah"
export type EmployeeStatus = "active" | "inactive"

export type EmployeeEducation = {
  id: number
  educationLevel: string
  schoolName: string
  graduationYear: number
}

export type Employee = {
  id: number
  nip: string
  name: string
  email: string
  phone: string
  photoPath: string | null
  birthPlace: string
  birthDate: string
  maritalStatus: MaritalStatus
  childrenCount: number
  joinedAt: string
  position: (typeof positions)[number]
  department: (typeof departments)[number]
  employmentType: EmploymentType
  gender: "Laki-laki" | "Perempuan"
  distanceKm: number
  district: (typeof districts)[number]
  regency: (typeof regencies)[number]
  province: (typeof provinces)[number]
  fullAddress: string
  status: EmployeeStatus
  educations: EmployeeEducation[]
}

export const dataPegawai: Employee[] = [
  {
    id: 1,
    nip: "00241411",
    name: "Ahmad Hendarto",
    email: "ahmad@email.com",
    phone: "+6292415611611",
    photoPath: "/images/pegawai/ahmad.jpg",
    birthPlace: "Yogyakarta",
    birthDate: "1992-06-24",
    maritalStatus: "Belum Menikah",
    childrenCount: 0,
    joinedAt: "2026-05-14",
    position: positions[0],
    department: departments[0],
    employmentType: "pkwtt",
    gender: "Laki-laki",
    distanceKm: 5.2,
    district: districts[4],
    regency: regencies[0],
    province: provinces[0],
    fullAddress: "Jl. Prapanca No. 6A, Kasihan, Bantul",
    status: "active",
    educations: [
      { id: 1, educationLevel: "S1", schoolName: "Universitas Gadjah Mada", graduationYear: 2012 },
      { id: 2, educationLevel: "SMA", schoolName: "SMA Negeri 1", graduationYear: 2008 },
    ],
  },
  {
    id: 2,
    nip: "00241412",
    name: "Riko Salim",
    email: "riko.salim@email.com",
    phone: "+6281234567802",
    photoPath: "/images/pegawai/dio.jpg",
    birthPlace: "Sleman",
    birthDate: "1990-03-11",
    maritalStatus: "Menikah",
    childrenCount: 1,
    joinedAt: "2026-05-14",
    position: positions[1],
    department: departments[0],
    employmentType: "pkwt",
    gender: "Laki-laki",
    distanceKm: 8.7,
    district: districts[0],
    regency: regencies[4],
    province: provinces[0],
    fullAddress: "Jl. Malioboro No. 12, Danurejan",
    status: "active",
    educations: [
      { id: 1, educationLevel: "S1", schoolName: "Universitas Islam Indonesia", graduationYear: 2013 },
    ],
  },
  {
    id: 3,
    nip: "00241413",
    name: "Dhea Angela",
    email: "dhea.angela@email.com",
    phone: "+6281234567803",
    photoPath: "/images/pegawai/geza.jpg",
    birthPlace: "Bantul",
    birthDate: "1995-09-02",
    maritalStatus: "Belum Menikah",
    childrenCount: 0,
    joinedAt: "2026-05-14",
    position: positions[2],
    department: departments[2],
    employmentType: "pkwtt",
    gender: "Perempuan",
    distanceKm: 3.4,
    district: districts[1],
    regency: regencies[4],
    province: provinces[0],
    fullAddress: "Jl. Sosrowijayan No. 3, Gedongtengen",
    status: "active",
    educations: [
      { id: 1, educationLevel: "S1", schoolName: "Universitas Atma Jaya Yogyakarta", graduationYear: 2017 },
    ],
  },
  {
    id: 4,
    nip: "00241414",
    name: "Shani Ratnasari",
    email: "shani.ratnasari@email.com",
    phone: "+6281234567804",
    photoPath: "/images/pegawai/gita.jpg",
    birthPlace: "Yogyakarta",
    birthDate: "1988-12-20",
    maritalStatus: "Menikah",
    childrenCount: 2,
    joinedAt: "2026-05-14",
    position: positions[3],
    department: departments[0],
    employmentType: "pkwtt",
    gender: "Perempuan",
    distanceKm: 12.1,
    district: districts[2],
    regency: regencies[4],
    province: provinces[0],
    fullAddress: "Jl. Colombo No. 8, Gondokusuman",
    status: "active",
    educations: [
      { id: 1, educationLevel: "S2", schoolName: "Universitas Gadjah Mada", graduationYear: 2015 },
      { id: 2, educationLevel: "S1", schoolName: "Universitas Diponegoro", graduationYear: 2011 },
    ],
  },
  {
    id: 5,
    nip: "00241415",
    name: "Reza Pratama",
    email: "reza.pratama@email.com",
    phone: "+6281234567805",
    photoPath: "/images/pegawai/reza.jpg",
    birthPlace: "Magelang",
    birthDate: "1993-01-30",
    maritalStatus: "Belum Menikah",
    childrenCount: 0,
    joinedAt: "2026-06-01",
    position: positions[4],
    department: departments[1],
    employmentType: "magang",
    gender: "Laki-laki",
    distanceKm: 6.6,
    district: districts[3],
    regency: regencies[4],
    province: provinces[0],
    fullAddress: "Jl. Diponegoro No. 20, Jetis",
    status: "inactive",
    educations: [
      { id: 1, educationLevel: "S1", schoolName: "Universitas Negeri Yogyakarta", graduationYear: 2016 },
    ],
  },
]
