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
import { roles, users } from "@/db/schema";
import { roleSchema } from "@/lib/validations";
import { eq, and, count } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "roles:write");
    if (permCheck) return permCheck;

    const { id } = await params;
    const body = await req.json();
    const result = roleSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;
    const tenantId = session.user.tenantId;

    // Load existing role
    const [existing] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));

    if (!existing) return notFound("Role not found");

    // System roles: cannot change slug
    if (existing.isSystem && validated.slug && validated.slug !== existing.slug) {
      return badRequest("Cannot change slug of system roles");
    }

    // Check slug uniqueness if changing
    if (validated.slug && validated.slug !== existing.slug) {
      const [dupe] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(and(eq(roles.tenantId, tenantId), eq(roles.slug, validated.slug)))
        .limit(1);
      if (dupe) return badRequest("A role with this slug already exists");
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.nameEn !== undefined) updateData.nameEn = validated.nameEn;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.permissions !== undefined)
      updateData.permissions = JSON.stringify(validated.permissions);
    if (validated.isDefault !== undefined) updateData.isDefault = validated.isDefault;

    const [updated] = await db
      .update(roles)
      .set(updateData)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)))
      .returning();

    if (!updated) return notFound("Role not found");

    return success({
      ...updated,
      permissions: JSON.parse(updated.permissions),
    });
  } catch (error) {
    console.error("PATCH /api/roles/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "roles:delete");
    if (permCheck) return permCheck;

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Load existing role
    const [existing] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));

    if (!existing) return notFound("Role not found");

    if (existing.isSystem) {
      return forbidden("Cannot delete system roles");
    }

    // Check if users are assigned
    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.roleId, id)));

    if (userCount.count > 0) {
      return badRequest("Cannot delete a role that has users assigned. Reassign users first.");
    }

    await db
      .delete(roles)
      .where(and(eq(roles.id, id), eq(roles.tenantId, tenantId)));

    return success({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/roles/[id] error:", error);
    return serverError();
  }
}
