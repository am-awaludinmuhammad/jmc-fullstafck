import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifySession, deleteSession } from "@/lib/auth/session";

export async function POST() {
  const session = await verifySession();

  if (session) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { lastLogoutAt: new Date() },
    });
  }

  await deleteSession();

  return NextResponse.json({ success: true });
}
