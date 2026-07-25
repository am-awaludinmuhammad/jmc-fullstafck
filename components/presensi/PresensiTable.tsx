"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, Upload, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { MONTH_NAMES_ID } from "@/lib/format"

type SummaryRow = {
  employeeId: number
  name: string
  position: string
  hadir: number
  statusHadir: string
  cuti: number
  kuotaCuti: number
  izin: number
  kuotaIzin: number
  unpaidLeave: number
  kuotaUnpaidLeave: number
}

export function PresensiTable({
  periodYear,
  periodMonth,
  summaries,
}: {
  periodYear: number
  periodMonth: number
  summaries: SummaryRow[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState("")

  function updatePeriod(year: number, month: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", String(year))
    params.set("month", String(month))
    router.push(`/presensi?${params.toString()}`)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportMessage("")

    try {
      const formData = new FormData()
      formData.set("file", file)

      const response = await fetch("/api/attendance/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setImportMessage(data.error ?? "Gagal mengimpor data presensi")
        return
      }

      const errorNote = data.errors?.length ? `, ${data.errors.length} baris gagal` : ""
      setImportMessage(`Berhasil memproses ${data.processedRows} dari ${data.totalRows} baris${errorNote}`)
      router.refresh()
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => periodYear - 2 + i)

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-2 p-4 border-b flex-wrap">
        <h2 className="font-semibold">Rekap Presensi</h2>
        <div className="flex items-center gap-2">
          <a href="/api/attendance/template">
            <Button type="button" variant="outline">
              <Download className="size-4" />
              Download Template
            </Button>
          </a>
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload className="size-4" />
            {importing ? "Mengimpor..." : "Import Excel"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleImport}
          />
        </div>
      </div>

      {importMessage && (
        <div className="px-4 pt-4 text-sm text-muted-foreground">{importMessage}</div>
      )}

      <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-end">
        <Select value={String(periodMonth)} onValueChange={(v) => updatePeriod(periodYear, Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES_ID.map((name, index) => (
              <SelectItem key={name} value={String(index + 1)}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(periodYear)} onValueChange={(v) => updatePeriod(Number(v), periodMonth)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">No</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Hadir</TableHead>
            <TableHead>Status Hadir</TableHead>
            <TableHead>Cuti</TableHead>
            <TableHead>Kuota Cuti</TableHead>
            <TableHead>Izin</TableHead>
            <TableHead>Kuota Izin</TableHead>
            <TableHead>Unpaid Leave</TableHead>
            <TableHead>Kuota Unpaid Leave</TableHead>
            <TableHead className="text-center w-16">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground py-6">
                Belum ada data presensi untuk periode ini
              </TableCell>
            </TableRow>
          )}
          {summaries.map((item, index) => (
            <TableRow key={item.employeeId}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.position}</TableCell>
              <TableCell>{item.hadir.toFixed(1)}</TableCell>
              <TableCell>{item.statusHadir}</TableCell>
              <TableCell>{item.cuti.toFixed(1)}</TableCell>
              <TableCell>{item.kuotaCuti.toFixed(1)}</TableCell>
              <TableCell>{item.izin.toFixed(1)}</TableCell>
              <TableCell>{item.kuotaIzin.toFixed(1)}</TableCell>
              <TableCell>{item.unpaidLeave.toFixed(1)}</TableCell>
              <TableCell>{item.kuotaUnpaidLeave.toFixed(1)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/presensi/detail/${item.employeeId}?year=${periodYear}&month=${periodMonth}`}
                        className="hover:text-foreground"
                      >
                        <Eye className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Detail</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
