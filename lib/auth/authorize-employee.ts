import "server-only";
import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyEmployeeToken } from "@/lib/auth/employee-jwt";

type Action = "access" | "create" | "update" | "delete";

export async function requireEmployeePermission(request: NextRequest, action: Action) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { allowed: false as const, payload: null };
  }

  const payload = verifyEmployeeToken(token);
  if (!payload) {
    return { allowed: false as const, payload: null };
  }

  const permission = await prisma.rolePermission.findFirst({
    where: { roleId: payload.roleId, module: { code: "DATA_PEGAWAI" } },
  });

  if (!permission || !permission.canAccess) {
    return { allowed: false as const, payload };
  }

  if (action === "create" && !permission.canCreate) {
    return { allowed: false as const, payload };
  }

  if (action === "update" && permission.updateScope === "no") {
    return { allowed: false as const, payload };
  }

  if (action === "delete" && permission.deleteScope === "no") {
    return { allowed: false as const, payload };
  }

  return { allowed: true as const, payload, permission };
}
