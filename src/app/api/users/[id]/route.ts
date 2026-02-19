import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
  requirePermission,
  forbidden,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { users, roles } from "@/db/schema";
import { userUpdateSchema } from "@/lib/validations";
import { eq, and, count } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

const SLUG_TO_ENUM: Record<string, string> = {
  owner: "owner",
  admin: "admin",
  manager: "manager",
  staff: "staff",
  receptionist: "receptionist",
  accountant: "staff",
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "users:write");
    if (permCheck) return permCheck;

    const { id } = await params;
    const body = await req.json();
    const result = userUpdateSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;
    const tenantId = session.user.tenantId;

    // Load existing user
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));

    if (!existing) return notFound("User not found");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.email !== undefined) {
      // Check email uniqueness
      const [dupe] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, validated.email)))
        .limit(1);
      if (dupe && dupe.id !== id) {
        return badRequest("Email already in use");
      }
      updateData.email = validated.email;
    }

    if (validated.roleId !== undefined) {
      // Prevent removing the last owner
      if (existing.role === "owner") {
        const [ownerCount] = await db
          .select({ count: count() })
          .from(users)
          .where(and(eq(users.tenantId, tenantId), eq(users.role, "owner")));

        if (ownerCount.count <= 1) {
          // Check if the new role is also owner
          const [newRole] = await db
            .select({ slug: roles.slug })
            .from(roles)
            .where(eq(roles.id, validated.roleId))
            .limit(1);

          if (!newRole || newRole.slug !== "owner") {
            return forbidden("Cannot change the role of the last owner");
          }
        }
      }

      // Get role slug for enum mapping
      const [role] = await db
        .select({ slug: roles.slug })
        .from(roles)
        .where(and(eq(roles.id, validated.roleId), eq(roles.tenantId, tenantId)))
        .limit(1);

      if (!role) return badRequest("Invalid role");

      updateData.roleId = validated.roleId;
      updateData.role = SLUG_TO_ENUM[role.slug] ?? "staff";
    }

    if (validated.customPermissions !== undefined) {
      updateData.customPermissions = validated.customPermissions
        ? JSON.stringify(validated.customPermissions)
        : null;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        roleId: users.roleId,
        customPermissions: users.customPermissions,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!updated) return notFound("User not found");

    return success({
      ...updated,
      customPermissions: updated.customPermissions
        ? JSON.parse(updated.customPermissions)
        : null,
    });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "users:delete");
    if (permCheck) return permCheck;

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Prevent deleting yourself
    if (id === session.user.id) {
      return forbidden("Cannot delete your own account");
    }

    // Load existing user
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));

    if (!existing) return notFound("User not found");

    // Prevent deleting the last owner
    if (existing.role === "owner") {
      const [ownerCount] = await db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, "owner")));

      if (ownerCount.count <= 1) {
        return forbidden("Cannot delete the last owner");
      }
    }

    await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)));

    return success({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return serverError();
  }
}
