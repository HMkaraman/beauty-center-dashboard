import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  resolvePermissions,
  type Permission,
  type Role,
  PREDEFINED_ROLES,
} from "@/lib/permissions";

// Fallback: map old enum role to permissions from predefined templates
function getFallbackPermissions(role: string): Permission[] {
  const template = PREDEFINED_ROLES.find((r) => r.slug === role);
  return template?.permissions ?? [];
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const userId = session.user.id;

    // Fetch user with roleId and customPermissions
    const [user] = await db
      .select({
        roleId: users.roleId,
        customPermissions: users.customPermissions,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return unauthorized();

    let rolePermissions: Permission[];

    if (user.roleId) {
      // Load permissions from the dynamic role
      const [role] = await db
        .select({ permissions: roles.permissions })
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);

      rolePermissions = role ? JSON.parse(role.permissions) : getFallbackPermissions(user.role);
    } else {
      // Fallback to old enum-based permissions
      rolePermissions = getFallbackPermissions(user.role);
    }

    const customPerms = user.customPermissions
      ? JSON.parse(user.customPermissions)
      : null;

    const permissions = resolvePermissions(rolePermissions, customPerms);

    return success({ permissions });
  } catch (error) {
    console.error("GET /api/auth/permissions error:", error);
    return serverError();
  }
}
