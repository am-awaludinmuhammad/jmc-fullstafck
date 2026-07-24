"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

import { logAktivitas } from "@/data/log-aktivitas"
import { formatDateTimeID } from "@/lib/format"

export default function LogAktivitasPage() {
  const [search, setSearch] = useState("")

  const filtered = logAktivitas.filter((item) =>
    `${item.user} ${item.moduleCode} ${item.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-end gap-2 p-4 border-b">
        <div className="relative w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari Data ..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">No</TableHead>
            <TableHead>Nama User</TableHead>
            <TableHead>Modul</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell>{item.moduleCode}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{formatDateTimeID(item.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end p-4 border-t">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
