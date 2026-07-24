import { prisma } from "@/lib/prisma"
import { RoleTable } from "@/components/role/RoleTable"

export default async function ManajemenRolePage() {
  const roles = await prisma.role.findMany({ orderBy: { id: "asc" } })

  return <RoleTable roles={roles} />
}
