import { NextRequest } from "next/server";
import { authenticateApiKey, checkRateLimit } from "@/lib/api-v1-auth";
import { unauthorized, success, serverError, getPaginationParams } from "@/lib/api-utils";
import { db } from "@/db/db";
import { clients } from "@/db/schema";
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
    const status = url.searchParams.get("status");

    const conditions = [eq(clients.tenantId, auth.tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(clients.name, `%${search}%`)} OR ${ilike(clients.phone, `%${search}%`)} OR ${ilike(clients.email, `%${search}%`)})`
      );
    }

    if (status === "active" || status === "inactive") {
      conditions.push(eq(clients.status, status));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          email: clients.email,
          status: clients.status,
          joinDate: clients.joinDate,
          notes: clients.notes,
          createdAt: clients.createdAt,
          updatedAt: clients.updatedAt,
        })
        .from(clients)
        .where(whereClause)
        .orderBy(desc(clients.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(clients)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/v1/clients error:", error);
    return serverError();
  }
}
