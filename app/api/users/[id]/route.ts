import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requirePermission } from "@/lib/auth/authorize";
import { isValidUsername, isValidPassword } from "@/lib/users/validate";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePermission("KELOLA_USER", "update");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);
  const body = await request.json();
  const { employeeId, username, email, cellphone, roleId, password, status } = body;

  if (!employeeId || !username || !roleId) {
    return NextResponse.json(
      { error: "Nama pengguna, username, dan role wajib diisi" },
      { status: 400 }
    );
  }

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username minimal 6 karakter, huruf kecil dan angka saja, tanpa spasi" },
      { status: 400 }
    );
  }

  if (password && !isValidPassword(password)) {
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

  const isInactive = status === false;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          employeeId: employee.id,
          name: employee.name,
          username,
          email: email || null,
          cellphone: cellphone || null,
          roleId: Number(roleId),
          status: isInactive ? "inactive" : "active",
          ...(password ? { password: await hashPassword(password) } : {}),
        },
      }),
      ...(isInactive
        ? [
            prisma.userSession.updateMany({
              where: { userId, loggedOutAt: null },
              data: { loggedOutAt: new Date() },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ ok: true });
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePermission("KELOLA_USER", "delete");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const { id } = await params;
  const userId = Number(id);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    }),
    prisma.userSession.updateMany({
      where: { userId, loggedOutAt: null },
      data: { loggedOutAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
