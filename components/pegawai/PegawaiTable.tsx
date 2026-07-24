"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  FileText,
  CloudDownload,
  ArrowUpDown,
} from "lucide-react"
import { useRouter } from "next/navigation"

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

import { formatDateID, masaKerja } from "@/lib/format"
import { getEmployeeToken } from "@/lib/employees/client-auth"

type Position = { id: number; name: string }

type EmployeeRow = {
  id: number
  nip: string
  name: string
  photoPath: string | null
  joinedAt: Date
  employmentType: "pkwtt" | "pkwt" | "magang"
  position: { id: number; name: string }
  department: { name: string }
}

function masaKerjaTahun(joinedAt: Date) {
  const now = new Date()
  let years = now.getFullYear() - joinedAt.getFullYear()
  const months = now.getMonth() - joinedAt.getMonth()
  if (months < 0 || (months === 0 && now.getDate() < joinedAt.getDate())) {
    years -= 1
  }
  return Math.max(years, 0)
}

type SortKey = "nip" | "name" | "position" | "joinedAt" | "masaKerja"

function SortableHead({
  label,
  sortKeyName,
  activeSortKey,
  sortAsc,
  onSort,
}: {
  label: string
  sortKeyName: SortKey
  activeSortKey: SortKey
  sortAsc: boolean
  onSort: (key: SortKey) => void
}) {
  return (
    <TableHead>
      <button
        type="button"
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => onSort(sortKeyName)}
      >
        {label}
        <ArrowUpDown className={activeSortKey === sortKeyName ? (sortAsc ? "size-3" : "size-3 rotate-180") : "size-3 opacity-40"} />
      </button>
    </TableHead>
  )
}

function DeleteEmployeeAlert({ employee }: { employee: EmployeeRow }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const token = await getEmployeeToken()
      await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
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
            Apakah kamu ingin menghapus data pegawai &quot;{employee.name}&quot;?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function PegawaiTable({
  employees,
  positions,
}: {
  employees: EmployeeRow[]
  positions: Position[]
}) {
  const [search, setSearch] = useState("")
  const [positionId, setPositionId] = useState<string>("")
  const [employmentType, setEmploymentType] = useState<string>("")
  const [masaKerjaMin, setMasaKerjaMin] = useState("")
  const [masaKerjaMax, setMasaKerjaMax] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortAsc, setSortAsc] = useState(true)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const filtered = useMemo(() => {
    const min = masaKerjaMin ? Number(masaKerjaMin) : null
    const max = masaKerjaMax ? Number(masaKerjaMax) : null

    const result = employees.filter((item) => {
      const matchesSearch = `${item.name} ${item.nip} ${item.position.name}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesPosition = !positionId || String(item.position.id) === positionId
      const matchesEmploymentType = !employmentType || item.employmentType === employmentType
      const mk = masaKerjaTahun(item.joinedAt)
      const matchesMin = min === null || mk >= min
      const matchesMax = max === null || mk <= max

      return matchesSearch && matchesPosition && matchesEmploymentType && matchesMin && matchesMax
    })

    result.sort((a, b) => {
      let compare = 0
      if (sortKey === "nip") compare = a.nip.localeCompare(b.nip)
      if (sortKey === "name") compare = a.name.localeCompare(b.name)
      if (sortKey === "position") compare = a.position.name.localeCompare(b.position.name)
      if (sortKey === "joinedAt") compare = a.joinedAt.getTime() - b.joinedAt.getTime()
      if (sortKey === "masaKerja") compare = masaKerjaTahun(a.joinedAt) - masaKerjaTahun(b.joinedAt)
      return sortAsc ? compare : -compare
    })

    return result
  }, [employees, search, positionId, employmentType, masaKerjaMin, masaKerjaMax, sortKey, sortAsc])

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
          <Input
            type="number"
            min={0}
            className="w-16"
            value={masaKerjaMin}
            onChange={(e) => setMasaKerjaMin(e.target.value)}
          />
          <span>-</span>
          <Input
            type="number"
            className="w-16"
            min={0}
            value={masaKerjaMax}
            onChange={(e) => setMasaKerjaMax(e.target.value)}
          />
        </div>

        <Select value={positionId} onValueChange={setPositionId}>
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

        <Select value={employmentType} onValueChange={setEmploymentType}>
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
            <SortableHead label="NIP" sortKeyName="nip" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            <SortableHead label="Nama" sortKeyName="name" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            <SortableHead label="Jabatan" sortKeyName="position" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            <SortableHead label="Tanggal Masuk" sortKeyName="joinedAt" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            <SortableHead label="Masa Kerja" sortKeyName="masaKerja" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
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
                      <span className="opacity-40 cursor-not-allowed">
                        <CloudDownload className="size-4" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>

                  <DeleteEmployeeAlert employee={item} />
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
                      unoptimized
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
