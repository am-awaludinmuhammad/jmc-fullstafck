import "server-only";
import * as XLSX from "xlsx";

export const TEMPLATE_HEADERS = [
  "NIP",
  "Tanggal (YYYY-MM-DD)",
  "Jenis (hadir/cuti/izin/unpaid_leave)",
  "Lokasi Checkin",
  "Jam Checkin (HH:mm)",
  "Lokasi Checkout",
  "Jam Checkout (HH:mm)",
  "Verifikasi (Disetujui/Ditolak)",
  "Verifikator (Lead/Manager/HRD)",
  "Keterangan",
];

export function buildTemplateWorkbook() {
  const worksheet = XLSX.utils.aoa_to_sheet([
    TEMPLATE_HEADERS,
    ["00241411", "2026-06-02", "hadir", "Gedung Utama", "08:00", "Gedung Utama", "17:00", "Disetujui", "HRD", ""],
    ["00241411", "2026-06-03", "cuti", "", "", "", "", "Disetujui", "HRD", "Cuti tahunan"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Presensi");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export type ParsedAttendanceRow = {
  rowNumber: number;
  nip: string;
  date: string;
  type: string;
  checkinLocation: string;
  checkinTime: string;
  checkoutLocation: string;
  checkoutTime: string;
  verification: string;
  verifiedByRole: string;
  remarks: string;
};

function cellToDateString(cell: unknown): string {
  if (cell instanceof Date) {
    const y = cell.getUTCFullYear();
    const m = String(cell.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cell.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(cell ?? "").trim();
}

function cellToTimeString(cell: unknown): string {
  if (cell instanceof Date) {
    const h = String(cell.getUTCHours()).padStart(2, "0");
    const m = String(cell.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return String(cell ?? "").trim();
}

export function parseAttendanceWorkbook(buffer: Buffer): ParsedAttendanceRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });

  return rows
    .slice(1)
    .map((row, index) => ({
      rowNumber: index + 2,
      nip: String(row[0] ?? "").trim(),
      date: cellToDateString(row[1]),
      type: String(row[2] ?? "").trim().toLowerCase().replace(/\s+/g, "_"),
      checkinLocation: String(row[3] ?? "").trim(),
      checkinTime: cellToTimeString(row[4]),
      checkoutLocation: String(row[5] ?? "").trim(),
      checkoutTime: cellToTimeString(row[6]),
      verification: String(row[7] ?? "Disetujui").trim(),
      verifiedByRole: String(row[8] ?? "").trim(),
      remarks: String(row[9] ?? "").trim(),
    }))
    .filter((row) => row.nip);
}
