import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { serviceCategories } from "@/db/schema";
import { serviceCategorySchema } from "@/lib/validations";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const sectionId = url.searchParams.get("sectionId");

    const conditions = [eq(serviceCategories.tenantId, tenantId)];

    if (sectionId) {
      conditions.push(eq(serviceCategories.sectionId, sectionId));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(serviceCategories)
        .where(whereClause)
        .orderBy(serviceCategories.sortOrder),
      db
        .select({ total: count() })
        .from(serviceCategories)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("GET /api/service-categories error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = serviceCategorySchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [created] = await db
      .insert(serviceCategories)
      .values({
        tenantId: session.user.tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        sectionId: validated.sectionId,
        sortOrder: validated.sortOrder ?? 0,
      })
      .returning();

    return success(created, 201);
  } catch (error) {
    console.error("POST /api/service-categories error:", error);
    return serverError();
  }
}
