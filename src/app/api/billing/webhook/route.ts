import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PLANS, type PlanType } from "@/lib/stripe";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const parts = signature.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const sigPart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !sigPart) return false;

    const timestamp = timestampPart.split("=")[1];
    const sig = sigPart.split("=")[1];

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
  } catch {
    return false;
  }
}

function getPlanFromPriceId(priceId: string): PlanType {
  const priceMap: Record<string, PlanType> = {
    [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
    [process.env.STRIPE_PRICE_PROFESSIONAL || ""]: "professional",
    [process.env.STRIPE_PRICE_ENTERPRISE || ""]: "enterprise",
  };
  return priceMap[priceId] || "starter";
}

interface StripeEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify webhook signature in production
    if (STRIPE_WEBHOOK_SECRET) {
      const isValid = verifyStripeSignature(
        rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      if (!isValid) {
        console.error("Stripe webhook signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    const event: StripeEvent = JSON.parse(rawBody);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (customerId && subscriptionId) {
          await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: subscriptionId,
              status: "active",
              currentPeriodStart: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        const status = sub.status as string;
        const items = sub.items as Record<string, unknown> | undefined;
        const itemsData = items?.data as Array<Record<string, unknown>> | undefined;
        const firstItem = itemsData?.[0];
        const priceObj = firstItem?.price as Record<string, unknown> | undefined;
        const priceId = priceObj?.id as string | undefined;

        const plan = priceId ? getPlanFromPriceId(priceId) : undefined;
        const planConfig = plan ? PLANS[plan] : undefined;

        const statusMap: Record<string, typeof subscriptions.$inferSelect["status"]> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "unpaid",
          incomplete: "incomplete",
        };

        const mappedStatus = statusMap[status] || "active";

        const updateData: Record<string, unknown> = {
          status: mappedStatus,
          updatedAt: new Date(),
        };

        if (plan) {
          updateData.plan = plan;
        }
        if (planConfig && "maxStaff" in planConfig) {
          updateData.maxStaff = planConfig.maxStaff;
          updateData.maxLocations = planConfig.maxLocations;
        }
        if (priceId) {
          updateData.stripePriceId = priceId;
        }

        const currentPeriodEnd = sub.current_period_end as number | undefined;
        const currentPeriodStart = sub.current_period_start as
          | number
          | undefined;

        if (currentPeriodEnd) {
          updateData.currentPeriodEnd = new Date(currentPeriodEnd * 1000);
        }
        if (currentPeriodStart) {
          updateData.currentPeriodStart = new Date(currentPeriodStart * 1000);
        }

        if (customerId) {
          await db
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        if (customerId) {
          await db
            .update(subscriptions)
            .set({
              status: "canceled",
              canceledAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        if (customerId) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeCustomerId, customerId));
        }
        break;
      }

      default:
        // Unhandled event type — just acknowledge
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/billing/webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
