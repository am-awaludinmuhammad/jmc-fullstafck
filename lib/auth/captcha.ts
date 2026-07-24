import "server-only";
import { randomInt } from "crypto";
import { cookies } from "next/headers";

const CAPTCHA_COOKIE_NAME = "captcha_code";
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function generateCaptcha() {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += CAPTCHA_CHARS[randomInt(CAPTCHA_CHARS.length)];
  }

  const cookieStore = await cookies();
  cookieStore.set(CAPTCHA_COOKIE_NAME, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CAPTCHA_TTL_MS / 1000,
  });

  return code;
}

export async function verifyCaptcha(input: string) {
  const cookieStore = await cookies();
  const expected = cookieStore.get(CAPTCHA_COOKIE_NAME)?.value;
  cookieStore.delete(CAPTCHA_COOKIE_NAME);

  if (!expected) {
    return false;
  }

  return expected.toUpperCase() === input.trim().toUpperCase();
}
