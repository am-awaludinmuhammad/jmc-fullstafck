import "server-only";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "session_token";
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
const REMEMBER_ME_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession({
  userId,
  rememberMe,
  ipAddress,
  userAgent,
}: {
  userId: number;
  rememberMe: boolean;
  ipAddress: string;
  userAgent: string;
}) {
  const sessionToken = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (rememberMe ? REMEMBER_ME_MS : IDLE_TIMEOUT_MS));

  await prisma.userSession.create({
    data: {
      userId,
      sessionToken,
      rememberMe,
      ipAddress,
      userAgent,
      lastActivityAt: now,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: { sessionToken: token },
    include: { user: { include: { role: true } } },
  });

  if (!session || session.loggedOutAt) {
    return null;
  }

  const now = new Date();

  if (now > session.expiresAt) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: { loggedOutAt: now },
    });
    return null;
  }

  if (!session.rememberMe && now.getTime() - session.lastActivityAt.getTime() > IDLE_TIMEOUT_MS) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: { loggedOutAt: now },
    });
    return null;
  }

  const newExpiresAt = session.rememberMe
    ? session.expiresAt
    : new Date(now.getTime() + IDLE_TIMEOUT_MS);

  await prisma.userSession.update({
    where: { id: session.id },
    data: { lastActivityAt: now, expiresAt: newExpiresAt },
  });

  return session;
});

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.userSession.updateMany({
      where: { sessionToken: token, loggedOutAt: null },
      data: { loggedOutAt: new Date() },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
