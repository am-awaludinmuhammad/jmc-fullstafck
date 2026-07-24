import "server-only";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth/session";

type Action = "access" | "create" | "update" | "delete";

export async function requirePermission(moduleCode: string, action: Action) {
  const session = await verifySession();

  if (!session) {
    return { allowed: false as const, session: null };
  }

  const permission = await prisma.rolePermission.findFirst({
    where: { roleId: session.user.roleId, module: { code: moduleCode } },
  });

  if (!permission || !permission.canAccess) {
    return { allowed: false as const, session };
  }

  if (action === "create" && !permission.canCreate) {
    return { allowed: false as const, session };
  }

  if (action === "update" && permission.updateScope === "no") {
    return { allowed: false as const, session };
  }

  if (action === "delete" && permission.deleteScope === "no") {
    return { allowed: false as const, session };
  }

  return { allowed: true as const, session, permission };
}
