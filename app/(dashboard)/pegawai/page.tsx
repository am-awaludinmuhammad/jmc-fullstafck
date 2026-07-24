"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  FileText,
  CloudDownload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

import { dataPegawai } from "@/data/pegawai"
import { positions } from "@/data/master"
import { formatDateID, masaKerja } from "@/lib/format"

export default function PegawaiPage() {
  const [search, setSearch] = useState("")

  const filtered = dataPegawai.filter((item) =>
    `${item.name} ${item.nip}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
        <h2 className="font-semibold">Data Pegawai</h2>
        <Button asChild>
          <Link href="/pegawai/form">
            <Plus className="size-4" />
            Tambah
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-end">
        <div className="flex items-center gap-1 text-sm text-nowrap">
          <span>Masa Kerja</span>
          <Input type="number" className="w-16" />
          <span>-</span>
          <Input type="number" className="w-16" />
        </div>

        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Jabatan" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position.id} value={String(position.id)}>
                {position.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status Kontrak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pkwtt">PKWTT</SelectItem>
            <SelectItem value="pkwt">PKWT</SelectItem>
            <SelectItem value="magang">Magang</SelectItem>
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
            <TableHead className="text-center w-24">Aksi</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Tanggal Masuk</TableHead>
            <TableHead>Masa Kerja</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item, index) => (
            <TableRow key={item.nip}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/pegawai/form/${item.nip}`} className="hover:text-foreground">
                        <Pencil className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/pegawai/${item.nip}`} className="hover:text-foreground">
                        <FileText className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Detail</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="#" className="hover:text-foreground">
                        <CloudDownload className="size-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>

                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <button className="text-destructive hover:opacity-80">
                            <Trash2 className="size-4" />
                          </button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Hapus</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah kamu ingin menghapus data ini?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
              <TableCell>{item.nip}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.photoPath && (
                    <Image
                      src={item.photoPath}
                      alt={item.name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover size-7"
                    />
                  )}
                  {item.name}
                </div>
              </TableCell>
              <TableCell>{item.position.name}</TableCell>
              <TableCell>{formatDateID(item.joinedAt)}</TableCell>
              <TableCell>{masaKerja(item.joinedAt)}</TableCell>
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
