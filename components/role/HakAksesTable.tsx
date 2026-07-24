"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, CircleCheck, CircleX } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
type PermissionRow = {
  id: number
  module: { name: string }
  canAccess: boolean
  canCreate: boolean
  readScope: string
  updateScope: string
  deleteScope: string
}

export function HakAksesTable({ permissions }: { permissions: PermissionRow[] }) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sorted = useMemo(() => {
    return [...permissions].sort((a, b) =>
      sortDir === "asc"
        ? a.module.name.localeCompare(b.module.name)
        : b.module.name.localeCompare(a.module.name)
    )
  }, [permissions, sortDir])

  const toggleSort = () => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">No</TableHead>
          <TableHead>
            <button type="button" onClick={toggleSort} className="flex items-center gap-1">
              Modul/Fitur
              <ArrowUpDown className="size-3.5" />
            </button>
          </TableHead>
          <TableHead className="text-center">Akses</TableHead>
          <TableHead className="text-center">Create</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Update</TableHead>
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((item, index) => (
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
  )
}
