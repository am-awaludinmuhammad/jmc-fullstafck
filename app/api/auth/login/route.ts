import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { verifyCaptcha } from "@/lib/auth/captcha";
import { generateLoginOtp } from "@/lib/auth/otp";
import { sendMail } from "@/lib/mail";
import { getRequestMeta, maskEmail } from "@/lib/auth/request-meta";

export async function POST(request: NextRequest) {
  const { identifier, password, captcha } = await request.json();

  if (!identifier || !password || !captcha) {
    return NextResponse.json({ error: "Data belum lengkap" }, { status: 400 });
  }

  const captchaValid = await verifyCaptcha(captcha);
  if (!captchaValid) {
    return NextResponse.json({ error: "Captcha tidak sesuai" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      status: "active",
      OR: [{ username: identifier }, { email: identifier }, { cellphone: identifier }],
    },
  });

  const invalidCredentials = NextResponse.json(
    { error: "Username/Email/No HP atau password salah" },
    { status: 401 }
  );

  if (!user) {
    return invalidCredentials;
  }

  const passwordValid = await verifyPassword(password, user.password);
  if (!passwordValid) {
    return invalidCredentials;
  }

  if (!user.email) {
    return NextResponse.json(
      { error: "User belum punya email terdaftar, hubungi admin" },
      { status: 400 }
    );
  }

  const { ipAddress, userAgent } = getRequestMeta(request);
  const { loginOtpId, code } = await generateLoginOtp({
    userId: user.id,
    sentTo: user.email,
    ipAddress,
    userAgent,
  });

  try {
    await sendMail({
      to: user.email,
      subject: "Kode OTP Login",
      html: `<p>Kode OTP kamu: <strong>${code}</strong></p><p>Berlaku 3 menit.</p>`,
    });
  } catch (error) {
    console.error("Gagal mengirim email OTP:", error);
    return NextResponse.json(
      { error: "Gagal mengirim OTP, cek konfigurasi SMTP" },
      { status: 502 }
    );
  }

  return NextResponse.json({ loginOtpId, sentTo: maskEmail(user.email) });
}
