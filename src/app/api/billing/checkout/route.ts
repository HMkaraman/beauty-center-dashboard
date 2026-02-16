import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { subscriptions, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe, PLANS, type PlanType } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const plan = body.plan as string;

    if (!plan || !["starter", "professional", "enterprise"].includes(plan)) {
      return badRequest("Invalid plan selected");
    }

    const tenantId = session.user.tenantId;
    const planKey = plan as PlanType;

    // Get tenant info
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      return badRequest("Tenant not found");
    }

    // Get or create subscription record
    let [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    let stripeCustomerId = subscription?.stripeCustomerId;

    // Create Stripe customer if needed
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: tenant.email || session.user.email,
        name: tenant.name,
        metadata: { tenantId },
      });
      stripeCustomerId = customer.id;

      if (subscription) {
        await db
          .update(subscriptions)
          .set({ stripeCustomerId, updatedAt: new Date() })
          .where(eq(subscriptions.id, subscription.id));
      } else {
        [subscription] = await db
          .insert(subscriptions)
          .values({
            tenantId,
            stripeCustomerId,
            plan: "trial",
            status: "trialing",
            maxStaff: PLANS.trial.maxStaff,
            maxLocations: PLANS.trial.maxLocations,
          })
          .returning();
      }
    }

    // Get the Stripe price ID from env (configured per plan)
    const priceIdEnvKey = `STRIPE_PRICE_${plan.toUpperCase()}`;
    const stripePriceId = process.env[priceIdEnvKey];

    if (!stripePriceId) {
      return badRequest(
        `Price not configured for plan: ${plan}. Set ${priceIdEnvKey} env var.`
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId!,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/settings?billing=canceled`,
    });

    // Store the selected plan info for webhook processing
    const planConfig = PLANS[planKey];
    await db
      .update(subscriptions)
      .set({
        stripePriceId,
        maxStaff: "maxStaff" in planConfig ? planConfig.maxStaff : 3,
        maxLocations:
          "maxLocations" in planConfig ? planConfig.maxLocations : 1,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.tenantId, tenantId));

    return success({ url: checkoutSession.url });
  } catch (error) {
    console.error("POST /api/billing/checkout error:", error);
    return serverError();
  }
}
