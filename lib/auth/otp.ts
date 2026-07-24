import "server-only";
import { randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const OTP_TTL_MS = 3 * 60 * 1000;

export async function generateLoginOtp({
  userId,
  sentTo,
  ipAddress,
  userAgent,
}: {
  userId: number;
  sentTo: string;
  ipAddress: string;
  userAgent: string;
}) {
  const code = randomInt(0, 10000).toString().padStart(4, "0");
  const otpHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const loginOtp = await prisma.loginOtp.create({
    data: {
      userId,
      otpHash,
      channel: "email",
      sentTo,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return { loginOtpId: loginOtp.id, code, expiresAt };
}

export async function verifyLoginOtp({
  loginOtpId,
  code,
}: {
  loginOtpId: number;
  code: string;
}) {
  const loginOtp = await prisma.loginOtp.findUnique({ where: { id: loginOtpId } });

  if (!loginOtp || loginOtp.usedAt) {
    return { valid: false as const, reason: "not_found" as const };
  }

  if (new Date() > loginOtp.expiresAt) {
    return { valid: false as const, reason: "expired" as const };
  }

  const match = await verifyPassword(code, loginOtp.otpHash);

  if (!match) {
    return { valid: false as const, reason: "mismatch" as const };
  }

  await prisma.loginOtp.update({
    where: { id: loginOtp.id },
    data: { verifiedAt: new Date(), usedAt: new Date() },
  });

  return { valid: true as const, userId: loginOtp.userId };
}
