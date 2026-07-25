"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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

import { formatRupiah } from "@/lib/format"

type Detail = {
  id: number
  employeeName: string
  roundedKm: number
  attendanceDays: number
  nominal: number
}

type SortKey = "employeeName" | "roundedKm" | "attendanceDays" | "nominal"

function SortableHead({
  label,
  sortKeyName,
  activeSortKey,
  sortAsc,
  onSort,
  className,
}: {
  label: string
  sortKeyName: SortKey
  activeSortKey: SortKey
  sortAsc: boolean
  onSort: (key: SortKey) => void
  className?: string
}) {
  return (
    <TableHead className={className}>
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

export function TransportDetailTable({
  periodId,
  status,
  details,
}: {
  periodId: number
  status: string
  details: Detail[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("employeeName")
  const [sortAsc, setSortAsc] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [message, setMessage] = useState("")

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const filtered = useMemo(() => {
    const result = details.filter((item) =>
      item.employeeName.toLowerCase().includes(search.toLowerCase())
    )

    result.sort((a, b) => {
      let compare = 0
      if (sortKey === "employeeName") compare = a.employeeName.localeCompare(b.employeeName)
      if (sortKey === "roundedKm") compare = a.roundedKm - b.roundedKm
      if (sortKey === "attendanceDays") compare = a.attendanceDays - b.attendanceDays
      if (sortKey === "nominal") compare = a.nominal - b.nominal
      return sortAsc ? compare : -compare
    })

    return result
  }, [details, search, sortKey, sortAsc])

  async function handleCalculate() {
    setCalculating(true)
    setMessage("")

    try {
      const response = await fetch(`/api/tunjangan/transport/${periodId}/calculate`, { method: "POST" })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setMessage(data.error ?? "Gagal menghitung tunjangan")
        return
      }

      setMessage(`Berhasil menghitung ${data.totalRecipients} penerima`)
      router.refresh()
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleCalculate} disabled={calculating}>
            {calculating ? "Menghitung..." : "Hitung Tunjangan"}
          </Button>
          <span className="text-sm text-muted-foreground">
            Status: {status === "draft" ? "Draft" : status === "calculated" ? "Terhitung" : "Terkunci"}
          </span>
        </div>
        <Input
          placeholder="Cari Data ..."
          className="w-52"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <div className="px-4 pt-4 text-sm text-muted-foreground">{message}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">No</TableHead>
            <SortableHead label="Nama Penerima" sortKeyName="employeeName" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} />
            <SortableHead label="Kilometer" sortKeyName="roundedKm" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} className="text-center" />
            <SortableHead label="Jumlah Hari" sortKeyName="attendanceDays" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} className="text-center" />
            <SortableHead label="Nominal" sortKeyName="nominal" activeSortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                Belum ada hasil perhitungan. Klik &quot;Hitung Tunjangan&quot; untuk memproses.
              </TableCell>
            </TableRow>
          )}
          {filtered.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{item.employeeName}</TableCell>
              <TableCell className="text-center">{item.roundedKm}</TableCell>
              <TableCell className="text-center">{item.attendanceDays.toFixed(1)}</TableCell>
              <TableCell className="text-right">{formatRupiah(item.nominal)}</TableCell>
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
