import { NextRequest } from "next/server";
import { authenticateApiKey, checkRateLimit } from "@/lib/api-v1-auth";
import { unauthorized, success, serverError, getPaginationParams } from "@/lib/api-utils";
import { db } from "@/db/db";
import { services } from "@/db/schema";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    if (!auth) return unauthorized();
    if (!checkRateLimit(auth.keyId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { page, limit, offset, search } = getPaginationParams(req);
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    // Only return active services via API
    const conditions = [
      eq(services.tenantId, auth.tenantId),
      eq(services.status, "active"),
    ];

    if (search) {
      conditions.push(
        sql`(${ilike(services.name, `%${search}%`)} OR ${ilike(services.nameEn, `%${search}%`)})`
      );
    }

    if (category) {
      conditions.push(ilike(services.category, `%${category}%`));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: services.id,
          name: services.name,
          nameEn: services.nameEn,
          category: services.category,
          duration: services.duration,
          price: services.price,
          description: services.description,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt,
        })
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
      data: data.map((s) => ({
        ...s,
        price: parseFloat(s.price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/services error:", error);
    return serverError();
  }
}
