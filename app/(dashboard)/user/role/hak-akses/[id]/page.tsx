import { notFound } from "next/navigation"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HakAksesTable } from "@/components/role/HakAksesTable"
import { prisma } from "@/lib/prisma"

export default async function HakAksesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const roleId = Number(id)

  const role = Number.isNaN(roleId)
    ? null
    : await prisma.role.findUnique({ where: { id: roleId } })

  if (!role) {
    notFound()
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: role.id },
    include: { module: true },
    orderBy: { module: { sortOrder: "asc" } },
  })

  return (
    <div className="grid gap-4">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 grid grid-cols-2 gap-4 max-w-xl">
          <div className="grid gap-1.5">
            <Label>Nama Role</Label>
            <Input value={role.name} readOnly disabled />
          </div>
          <div className="grid gap-1.5">
            <Label>Deskripsi</Label>
            <Textarea value={role.description} readOnly disabled rows={3} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <HakAksesTable permissions={rolePermissions} />
      </div>
    </div>
  )
}
