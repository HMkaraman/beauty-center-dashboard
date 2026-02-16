import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!subscription) {
      return success({
        id: null,
        plan: "trial",
        status: "trialing",
        maxStaff: 3,
        maxLocations: 1,
        trialEndsAt: null,
        currentPeriodEnd: null,
      });
    }

    return success({
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      maxStaff: subscription.maxStaff,
      maxLocations: subscription.maxLocations,
      trialEndsAt: subscription.trialEndsAt
        ? subscription.trialEndsAt.toISOString()
        : null,
      currentPeriodEnd: subscription.currentPeriodEnd
        ? subscription.currentPeriodEnd.toISOString()
        : null,
    });
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return serverError();
  }
}
