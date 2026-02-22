import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { healingJourneys } from "@/db/schema";
import { consentActionSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string; journeyId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();
    const result = consentActionSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const { action, signatureUrl } = result.data;

    const [journey] = await db
      .select()
      .from(healingJourneys)
      .where(
        and(
          eq(healingJourneys.id, journeyId),
          eq(healingJourneys.tenantId, tenantId)
        )
      );

    if (!journey) return notFound("Journey not found");

    if (action === "request_approval") {
      const [updated] = await db
        .update(healingJourneys)
        .set({
          consentStatus: "pending",
          consentRequestedAt: new Date(),
          consentRequestedById: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(healingJourneys.id, journeyId))
        .returning();

      return success(updated);
    }

    if (action === "approve") {
      if (!signatureUrl) {
        return badRequest("Signature URL is required for approval");
      }

      const [updated] = await db
        .update(healingJourneys)
        .set({
          consentStatus: "approved",
          signatureUrl,
          consentSignedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(healingJourneys.id, journeyId))
        .returning();

      return success(updated);
    }

    if (action === "reject") {
      const [updated] = await db
        .update(healingJourneys)
        .set({
          consentStatus: "rejected",
          consentSignedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(healingJourneys.id, journeyId))
        .returning();

      return success(updated);
    }

    return badRequest("Invalid action");
  } catch (error) {
    console.error("POST /api/clients/[id]/healing-journeys/[journeyId]/consent error:", error);
    return serverError();
  }
}
