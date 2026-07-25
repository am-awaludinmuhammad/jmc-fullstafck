import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/auth/authorize";
import { buildTemplateWorkbook } from "@/lib/attendance/excel";

export async function GET() {
  const { allowed } = await requirePermission("PRESENSI", "access");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const buffer = buildTemplateWorkbook();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=template-presensi.xlsx",
    },
  });
}
