import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { services, serviceCategories } from "@/db/schema";
import { serviceSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(services.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(services.name, `%${search}%`)} OR ${ilike(services.category, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(services)
        .where(whereClause)
        .orderBy(desc(services.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(services)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data: data.map((row) => ({
        ...row,
        price: parseFloat(row.price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // If categoryId provided, resolve category name from DB
    let categoryName = validated.category;
    if (validated.categoryId) {
      const [cat] = await db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, validated.categoryId));
      if (cat) {
        categoryName = cat.name;
      }
    }

    const [created] = await db
      .insert(services)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        categoryId: validated.categoryId,
        category: categoryName,
        duration: validated.duration,
        price: String(validated.price),
        status: validated.status,
        description: validated.description,
      })
      .returning();

    logActivity({
      session,
      entityType: "service",
      entityId: created.id,
      action: "create",
      entityLabel: created.name,
    });

    return success(
      {
        ...created,
        price: parseFloat(created.price),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/services error:", error);
    return serverError();
  }
}
