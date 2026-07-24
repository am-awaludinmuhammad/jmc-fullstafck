// Mock data shaped after the `Role` and `Module` models in prisma/schema.prisma.
// Static for now — will be replaced by a Prisma query once the backend is wired up.
//
// `RolePermission` below mirrors the `role_permissions` table from docs/db.txt,
// which has NO Prisma model yet (only Role and Module exist) — this is mock-only
// until that migration is added.

export type Role = {
  id: number
  code: string
  name: string
  description: string
}

export const roles: Role[] = [
  { id: 1, code: "SPR", name: "Super Admin", description: "Full akses sistem" },
  { id: 2, code: "ADM", name: "Admin", description: "Mengatur sistem" },
  { id: 3, code: "MKT", name: "Marketing", description: "Mengelola pemasaran" },
  { id: 4, code: "FIN", name: "Finance", description: "Mengelola keuangan" },
]

export type Module = {
  id: number
  code: string
  name: string
  sortOrder: number
}

export const modules: Module[] = [
  { id: 1, code: "PEGAWAI", name: "Data Pegawai", sortOrder: 1 },
  { id: 2, code: "TUNJANGAN", name: "Tunjangan", sortOrder: 2 },
  { id: 3, code: "USER", name: "Manajemen User", sortOrder: 3 },
  { id: 4, code: "LOG", name: "Log Aktifitas", sortOrder: 4 },
]

export type PermissionScope = "No" | "All" | "Own"

export type RolePermission = {
  id: number
  module: Module
  canAccess: boolean
  canCreate: boolean
  readScope: PermissionScope
  updateScope: PermissionScope
  deleteScope: PermissionScope
}

export const rolePermissions: RolePermission[] = [
  {
    id: 1,
    module: modules[0],
    canAccess: true,
    canCreate: true,
    readScope: "All",
    updateScope: "All",
    deleteScope: "All",
  },
  {
    id: 2,
    module: modules[1],
    canAccess: false,
    canCreate: false,
    readScope: "No",
    updateScope: "No",
    deleteScope: "No",
  },
  {
    id: 3,
    module: modules[2],
    canAccess: false,
    canCreate: true,
    readScope: "Own",
    updateScope: "Own",
    deleteScope: "Own",
  },
  {
    id: 4,
    module: modules[3],
    canAccess: true,
    canCreate: true,
    readScope: "All",
    updateScope: "All",
    deleteScope: "All",
  },
]
