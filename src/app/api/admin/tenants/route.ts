import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  forbidden,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { tenants, subscriptions, users } from "@/db/schema";
import { eq, ilike, sql, count, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    if (session.user.role !== "owner") {
      return forbidden("Admin access required");
    }

    const { search } = getPaginationParams(req);

    // Build query for tenants with subscription info and staff count
    // Use a left join to include tenants without subscriptions
    const baseQuery = db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        email: tenants.email,
        phone: tenants.phone,
        currency: tenants.currency,
        createdAt: tenants.createdAt,
        plan: subscriptions.plan,
        subscriptionStatus: subscriptions.status,
        maxStaff: subscriptions.maxStaff,
        staffCount: sql<number>`(
          SELECT COUNT(*) FROM users WHERE users.tenant_id = ${tenants.id}
        )`.as("staff_count"),
      })
      .from(tenants)
      .leftJoin(subscriptions, eq(tenants.id, subscriptions.tenantId))
      .orderBy(desc(tenants.createdAt));

    let data;
    if (search) {
      data = await baseQuery.where(ilike(tenants.name, `%${search}%`));
    } else {
      data = await baseQuery;
    }

    // Map to clean response
    const result = data.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      email: row.email,
      phone: row.phone,
      currency: row.currency,
      createdAt: row.createdAt.toISOString(),
      plan: row.plan || "trial",
      subscriptionStatus: row.subscriptionStatus || "trialing",
      maxStaff: row.maxStaff || 3,
      staffCount: Number(row.staffCount) || 0,
    }));

    return success({
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("GET /api/admin/tenants error:", error);
    return serverError();
  }
}
