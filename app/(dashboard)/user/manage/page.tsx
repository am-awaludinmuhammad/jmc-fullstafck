import { prisma } from "@/lib/prisma"
import { ManajemenUserTable } from "@/components/user/ManajemenUserTable"

export default async function ManajemenUserPage() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        role: true,
        employee: { include: { position: true, department: true } },
      },
      orderBy: { id: "asc" },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ])

  return <ManajemenUserTable users={users} roles={roles} />
}
