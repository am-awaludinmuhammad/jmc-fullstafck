"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

import { formatRupiah, monthNameID } from "@/lib/format"

type Period = {
  id: number
  periodYear: number
  periodMonth: number
  totalRecipients: number
  totalAmount: number
}

export function TransportPeriodTable({ periods }: { periods: Period[] }) {
  const [search, setSearch] = useState("")
  const [year, setYear] = useState<string>("")

  const years = Array.from(new Set(periods.map((p) => p.periodYear))).sort((a, b) => b - a)

  const filtered = periods.filter((item) => {
    const matchesSearch = monthNameID(item.periodMonth).toLowerCase().includes(search.toLowerCase())
    const matchesYear = !year || String(item.periodYear) === year
    return matchesSearch && matchesYear
  })

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-end">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Tahun" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <TableHead>Nama Bulan</TableHead>
            <TableHead className="text-center">Total Penerima</TableHead>
            <TableHead className="text-center">Total Tunjangan Transport</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{monthNameID(item.periodMonth)} {item.periodYear}</TableCell>
              <TableCell className="text-center">{item.totalRecipients}</TableCell>
              <TableCell className="text-right">{formatRupiah(item.totalAmount)}</TableCell>
              <TableCell className="text-center">
                <Link
                  href={`/tunjangan/transport/detail/${item.id}`}
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Detail
                </Link>
              </TableCell>
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
