import "server-only";
import type { NextRequest } from "next/server";

export function getRequestMeta(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return { ipAddress, userAgent };
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain || name.length <= 2) {
    return email;
  }
  return `${name.slice(0, 2)}${"*".repeat(name.length - 2)}@${domain}`;
}
