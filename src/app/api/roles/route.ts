import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  requirePermission,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { roles, users } from "@/db/schema";
import { roleSchema } from "@/lib/validations";
import { PREDEFINED_ROLES } from "@/lib/permissions";
import { eq, and, sql, count } from "drizzle-orm";

async function seedRolesIfNeeded(tenantId: string) {
  const existing = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.tenantId, tenantId))
    .limit(1);

  if (existing.length > 0) return;

  for (const template of PREDEFINED_ROLES) {
    await db.insert(roles).values({
      tenantId,
      name: template.name,
      nameEn: template.nameEn,
      slug: template.slug,
      isSystem: true,
      isDefault: template.slug === "staff",
      permissions: JSON.stringify(template.permissions),
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    // Auto-seed predefined roles if none exist
    await seedRolesIfNeeded(tenantId);

    // Get all roles with user counts
    const rolesData = await db
      .select()
      .from(roles)
      .where(eq(roles.tenantId, tenantId))
      .orderBy(roles.createdAt);

    const roleIds = rolesData.map((r) => r.id);
    let userCountMap: Record<string, number> = {};

    if (roleIds.length > 0) {
      const counts = await db
        .select({
          roleId: users.roleId,
          count: count(),
        })
        .from(users)
        .where(
          and(
            eq(users.tenantId, tenantId),
            sql`${users.roleId} IN ${roleIds}`
          )
        )
        .groupBy(users.roleId);

      userCountMap = Object.fromEntries(
        counts.map((r) => [r.roleId!, r.count])
      );
    }

    return success({
      data: rolesData.map((role) => ({
        ...role,
        permissions: JSON.parse(role.permissions),
        userCount: userCountMap[role.id] ?? 0,
      })),
    });
  } catch (error) {
    console.error("GET /api/roles error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "roles:write");
    if (permCheck) return permCheck;

    const body = await req.json();
    const result = roleSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;
    const tenantId = session.user.tenantId;

    // Check slug uniqueness within tenant
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), eq(roles.slug, validated.slug)))
      .limit(1);

    if (existing) {
      return badRequest("A role with this slug already exists");
    }

    const [created] = await db
      .insert(roles)
      .values({
        tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        slug: validated.slug,
        description: validated.description,
        isSystem: false,
        isDefault: validated.isDefault ?? false,
        permissions: JSON.stringify(validated.permissions),
      })
      .returning();

    return success(
      {
        ...created,
        permissions: JSON.parse(created.permissions),
        userCount: 0,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/roles error:", error);
    return serverError();
  }
}
