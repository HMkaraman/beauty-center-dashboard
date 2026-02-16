"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
  type Role,
} from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const role =
    ((session?.user as Record<string, unknown>)?.role as Role) || "staff";

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    isOwner: role === "owner",
    isAdmin: role === "owner" || role === "admin",
    isManager: role === "owner" || role === "admin" || role === "manager",
  };
}
