// Mock data shaped after the `User` model in prisma/schema.prisma (joined to
// Employee + Role). Static for now — will be replaced by a Prisma query once
// the backend is wired up.

import { dataPegawai, type Employee } from "./pegawai"
import { roles, type Role } from "./role"

export type ManagedUser = {
  id: number
  username: string
  status: "active" | "inactive"
  employee: Employee
  role: Role
}

export const dataUser: ManagedUser[] = [
  { id: 1, username: "ahmad", status: "active", employee: dataPegawai[0], role: roles[1] },
  { id: 2, username: "riko", status: "active", employee: dataPegawai[1], role: roles[1] },
  { id: 3, username: "dhea", status: "inactive", employee: dataPegawai[2], role: roles[1] },
  { id: 4, username: "shani", status: "active", employee: dataPegawai[3], role: roles[0] },
]
