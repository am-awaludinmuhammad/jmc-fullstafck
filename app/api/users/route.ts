import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requirePermission } from "@/lib/auth/authorize";
import { isValidUsername, isValidPassword } from "@/lib/users/validate";

export async function POST(request: NextRequest) {
  const { allowed } = await requirePermission("KELOLA_USER", "create");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const body = await request.json();
  const { employeeId, username, email, cellphone, roleId, password, status } = body;

  if (!employeeId || !username || !roleId || !password) {
    return NextResponse.json(
      { error: "Nama pengguna, username, role, dan password wajib diisi" },
      { status: 400 }
    );
  }

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username minimal 6 karakter, huruf kecil dan angka saja, tanpa spasi" },
      { status: 400 }
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter, ada huruf besar, huruf kecil, karakter khusus, tanpa spasi" },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findFirst({
    where: { id: Number(employeeId), deletedAt: null },
  });

  if (!employee) {
    return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        employeeId: employee.id,
        name: employee.name,
        username,
        email: email || null,
        cellphone: cellphone || null,
        roleId: Number(roleId),
        password: await hashPassword(password),
        status: status === false ? "inactive" : "active",
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Pegawai ini, username, email, atau nomor HP sudah dipakai" },
        { status: 409 }
      );
    }
    throw error;
  }
}
