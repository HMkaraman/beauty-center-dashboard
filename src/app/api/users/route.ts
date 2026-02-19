import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  requirePermission,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { users, roles } from "@/db/schema";
import { userCreateSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";

// Map role slugs to the old enum values for backward compat
const SLUG_TO_ENUM: Record<string, string> = {
  owner: "owner",
  admin: "admin",
  manager: "manager",
  staff: "staff",
  receptionist: "receptionist",
  accountant: "staff", // accountant maps to staff enum
};

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "users:read");
    if (permCheck) return permCheck;

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(users.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(users.name, `%${search}%`)} OR ${ilike(users.email, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          roleId: users.roleId,
          customPermissions: users.customPermissions,
          image: users.image,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users).where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    // Get role info for each user
    const roleIds = [...new Set(data.map((u) => u.roleId).filter(Boolean))] as string[];
    let roleMap: Record<string, { name: string; nameEn: string | null; slug: string }> = {};

    if (roleIds.length > 0) {
      const roleRows = await db
        .select({
          id: roles.id,
          name: roles.name,
          nameEn: roles.nameEn,
          slug: roles.slug,
        })
        .from(roles)
        .where(sql`${roles.id} IN ${roleIds}`);

      roleMap = Object.fromEntries(
        roleRows.map((r) => [r.id, { name: r.name, nameEn: r.nameEn, slug: r.slug }])
      );
    }

    return success({
      data: data.map((user) => ({
        ...user,
        customPermissions: user.customPermissions
          ? JSON.parse(user.customPermissions)
          : null,
        roleName: user.roleId ? roleMap[user.roleId]?.name ?? null : null,
        roleNameEn: user.roleId ? roleMap[user.roleId]?.nameEn ?? null : null,
        roleSlug: user.roleId ? roleMap[user.roleId]?.slug ?? null : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const permCheck = requirePermission(session, "users:write");
    if (permCheck) return permCheck;

    const body = await req.json();
    const result = userCreateSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;
    const tenantId = session.user.tenantId;

    // Check email uniqueness
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validated.email))
      .limit(1);

    if (existingUser) {
      return badRequest("Email already exists");
    }

    // Get the role to determine the old enum value
    const [role] = await db
      .select({ slug: roles.slug })
      .from(roles)
      .where(and(eq(roles.id, validated.roleId), eq(roles.tenantId, tenantId)))
      .limit(1);

    if (!role) {
      return badRequest("Invalid role");
    }

    const enumRole = SLUG_TO_ENUM[role.slug] ?? "staff";
    const passwordHash = await hash(validated.password, 12);

    const [created] = await db
      .insert(users)
      .values({
        tenantId,
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: enumRole as "owner" | "admin" | "manager" | "staff" | "receptionist",
        roleId: validated.roleId,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        roleId: users.roleId,
        image: users.image,
        createdAt: users.createdAt,
      });

    return success(
      {
        ...created,
        roleName: null,
        roleNameEn: null,
        roleSlug: role.slug,
        customPermissions: null,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/users error:", error);
    return serverError();
  }
}
