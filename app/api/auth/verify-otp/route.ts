import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyLoginOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/auth/request-meta";

export async function POST(request: NextRequest) {
  const { loginOtpId, code, rememberMe } = await request.json();

  if (!loginOtpId || !code) {
    return NextResponse.json({ error: "Data belum lengkap" }, { status: 400 });
  }

  const result = await verifyLoginOtp({ loginOtpId, code });

  if (!result.valid) {
    const message =
      result.reason === "expired"
        ? "Kode OTP sudah kedaluwarsa"
        : "Kode OTP salah";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const { ipAddress, userAgent } = getRequestMeta(request);
  await createSession({
    userId: result.userId,
    rememberMe: Boolean(rememberMe),
    ipAddress,
    userAgent,
  });

  await prisma.user.update({
    where: { id: result.userId },
    data: { lastLoginAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
