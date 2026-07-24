import { notFound } from "next/navigation"
import { CircleCheck, CircleX } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { roles, rolePermissions } from "@/data/role"

export default async function HakAksesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const role = roles.find((item) => String(item.id) === id)

  if (!role) {
    notFound()
  }

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
            <Input value={role.description} readOnly disabled />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead>Modul/Fitur</TableHead>
              <TableHead className="text-center">Akses</TableHead>
              <TableHead className="text-center">Create</TableHead>
              <TableHead>Read</TableHead>
              <TableHead>Update</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolePermissions.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>{item.module.name}</TableCell>
                <TableCell className="text-center">
                  {item.canAccess ? (
                    <CircleCheck className="inline size-4 text-green-600" />
                  ) : (
                    <CircleX className="inline size-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {item.canCreate ? (
                    <CircleCheck className="inline size-4 text-green-600" />
                  ) : (
                    <CircleX className="inline size-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell>{item.readScope}</TableCell>
                <TableCell>{item.updateScope}</TableCell>
                <TableCell>{item.deleteScope}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
