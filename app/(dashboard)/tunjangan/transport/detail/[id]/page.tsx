import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button-variants"
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

import { transportAllowancePeriods, transportAllowanceDetails } from "@/data/tunjangan"
import { formatRupiah, monthNameID } from "@/lib/format"

export default async function TunjanganTransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const period = transportAllowancePeriods.find((item) => String(item.id) === id)

  if (!period) {
    notFound()
  }

  const details = transportAllowanceDetails.filter((item) => item.periodId === period.id)

  return (
    <div className="grid gap-3">
      <h3 className="font-semibold text-lg">
        Bulan {monthNameID(period.periodMonth)} {period.periodYear}
      </h3>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b flex-wrap justify-between">
          <button type="button" className={buttonVariants()}>Hitung Tunjangan</button>
          <Input placeholder="Cari Data ..." className="w-52" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead>Nama Penerima</TableHead>
              <TableHead className="text-center">Kilometer</TableHead>
              <TableHead className="text-center">Jumlah Hari</TableHead>
              <TableHead className="text-center">Nominal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>{item.employeeName}</TableCell>
                <TableCell className="text-center">{item.roundedKm}</TableCell>
                <TableCell className="text-center">{item.attendanceDays}</TableCell>
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
    </div>
  )
}
