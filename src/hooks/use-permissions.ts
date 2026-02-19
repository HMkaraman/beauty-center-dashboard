"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
  type Role,
} from "@/lib/permissions";

export function usePermissions() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const role =
    ((session?.user as Record<string, unknown>)?.role as Role) || "staff";

  const { data } = useQuery({
    queryKey: ["auth", "permissions"],
    queryFn: () => apiFetch<{ permissions: Permission[] }>("/auth/permissions"),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const permissions = data?.permissions;

  return {
    role,
    can: (permission: Permission) =>
      permissions
        ? permissions.includes(permission)
        : hasPermission(role, permission),
    canAny: (perms: Permission[]) =>
      permissions
        ? perms.some((p) => permissions.includes(p))
        : hasAnyPermission(role, perms),
    isOwner: role === "owner",
    isAdmin: role === "owner" || role === "admin",
    isManager: role === "owner" || role === "admin" || role === "manager",
  };
}
