import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  forbidden,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { tenants, subscriptions, users } from "@/db/schema";
import { sql, count, inArray } from "drizzle-orm";
import { PLANS } from "@/lib/stripe";

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    if (session.user.role !== "owner") {
      return forbidden("Admin access required");
    }

    const [tenantsResult, activeSubsResult, mrrResult, usersResult] =
      await Promise.all([
        // Total tenants
        db.select({ total: count() }).from(tenants),

        // Active subscriptions (active + trialing)
        db
          .select({ total: count() })
          .from(subscriptions)
          .where(
            inArray(subscriptions.status, ["active", "trialing"])
          ),

        // Approximate MRR based on plan type for active subscriptions
        db
          .select({
            plan: subscriptions.plan,
            planCount: count(),
          })
          .from(subscriptions)
          .where(inArray(subscriptions.status, ["active"]))
          .groupBy(subscriptions.plan),

        // Total users
        db.select({ total: count() }).from(users),
      ]);

    // Calculate MRR from plan counts
    let mrr = 0;
    for (const row of mrrResult) {
      const plan = row.plan as keyof typeof PLANS;
      const planConfig = PLANS[plan];
      if (planConfig && "priceMonthly" in planConfig) {
        mrr += planConfig.priceMonthly * row.planCount;
      }
    }

    return success({
      totalTenants: tenantsResult[0]?.total ?? 0,
      activeSubscriptions: activeSubsResult[0]?.total ?? 0,
      mrr,
      totalUsers: usersResult[0]?.total ?? 0,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return serverError();
  }
}
