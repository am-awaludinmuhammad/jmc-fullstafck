import { NextResponse } from "next/server";

import { generateCaptcha } from "@/lib/auth/captcha";

export async function GET() {
  const code = await generateCaptcha();
  return NextResponse.json({ code });
}
