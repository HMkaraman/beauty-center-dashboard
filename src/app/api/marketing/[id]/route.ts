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
import { campaigns } from "@/db/schema";
import { campaignSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

    if (!campaign) return notFound("Campaign not found");

    return success({
      ...campaign,
      budget: parseFloat(campaign.budget),
    });
  } catch (error) {
    console.error("GET /api/marketing/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = campaignSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;

    const [existing] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

    if (!existing) return notFound("Campaign not found");

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.name !== undefined) updateValues.name = validated.name;
    if (validated.channel !== undefined) updateValues.channel = validated.channel;
    if (validated.status !== undefined) updateValues.status = validated.status;
    if (validated.startDate !== undefined) updateValues.startDate = validated.startDate;
    if (validated.endDate !== undefined) updateValues.endDate = validated.endDate;
    if (validated.budget !== undefined) updateValues.budget = String(validated.budget);
    if (validated.description !== undefined) updateValues.description = validated.description;

    const [updated] = await db
      .update(campaigns)
      .set(updateValues)
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)))
      .returning();

    logActivity({
      session,
      entityType: "campaign",
      entityId: id,
      action: "update",
      entityLabel: updated.name,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    return success({
      ...updated,
      budget: parseFloat(updated.budget),
    });
  } catch (error) {
    console.error("PATCH /api/marketing/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [existing] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

    if (!existing) return notFound("Campaign not found");

    await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.tenantId, tenantId)));

    logActivity({
      session,
      entityType: "campaign",
      entityId: id,
      action: "delete",
      entityLabel: existing.name,
    });

    return success({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/marketing/[id] error:", error);
    return serverError();
  }
}
