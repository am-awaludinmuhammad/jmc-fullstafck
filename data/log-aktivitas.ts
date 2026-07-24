// Mock data shaped after the `ActivityLog` model in prisma/schema.prisma
// (joined to User). Static for now — will be replaced by a Prisma query once
// the backend is wired up.

export type ActivityAction = "login" | "logout" | "create" | "read" | "update" | "delete"

export type ActivityLogEntry = {
  id: number
  user: string
  moduleCode: string
  action: ActivityAction
  description: string
  createdAt: string
}

export const logAktivitas: ActivityLogEntry[] = [
  {
    id: 1,
    user: "Administrator",
    moduleCode: "Dashboard",
    action: "login",
    description: "Login",
    createdAt: "2026-05-21T10:30:00",
  },
  {
    id: 2,
    user: "Administrator",
    moduleCode: "Data Pegawai",
    action: "update",
    description: "Ubah data pegawai",
    createdAt: "2026-05-21T10:32:00",
  },
  {
    id: 3,
    user: "Administrator",
    moduleCode: "Data Pegawai",
    action: "update",
    description: "Ubah data pegawai",
    createdAt: "2026-05-21T10:35:00",
  },
]
