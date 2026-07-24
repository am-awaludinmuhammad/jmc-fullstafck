import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "session_token";
const PUBLIC_PATHS = ["/login"];

async function hasValidSession(token: string | undefined) {
  if (!token) {
    return false;
  }

  const session = await prisma.userSession.findUnique({
    where: { sessionToken: token },
  });

  if (!session || session.loggedOutAt) {
    return false;
  }

  return session.expiresAt > new Date();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const hasSession = await hasValidSession(token);

  if (!hasSession && !isPublicPath) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (hasSession && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|logo|favicon.ico).*)"],
};
