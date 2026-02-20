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
import { sessionConsumptionLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [log] = await db
      .select()
      .from(sessionConsumptionLogs)
      .where(and(eq(sessionConsumptionLogs.id, id), eq(sessionConsumptionLogs.tenantId, tenantId)));

    if (!log) return notFound("Consumption log not found");

    return success({
      ...log,
      totalAllocated: log.totalAllocated ? parseFloat(log.totalAllocated) : null,
      amountUsed: log.amountUsed ? parseFloat(log.amountUsed) : null,
      leftoverAmount: log.leftoverAmount ? parseFloat(log.leftoverAmount) : null,
    });
  } catch (error) {
    console.error("GET /api/consumption/[id] error:", error);
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

    const [existing] = await db
      .select()
      .from(sessionConsumptionLogs)
      .where(and(eq(sessionConsumptionLogs.id, id), eq(sessionConsumptionLogs.tenantId, tenantId)));

    if (!existing) return notFound("Consumption log not found");

    const updateValues: Record<string, unknown> = {};
    if (body.actualShots !== undefined) updateValues.actualShots = body.actualShots;
    if (body.expectedMinShots !== undefined) updateValues.expectedMinShots = body.expectedMinShots;
    if (body.expectedMaxShots !== undefined) updateValues.expectedMaxShots = body.expectedMaxShots;
    if (body.shotDeviation !== undefined) updateValues.shotDeviation = body.shotDeviation;
    if (body.productName !== undefined) updateValues.productName = body.productName;
    if (body.totalAllocated !== undefined) updateValues.totalAllocated = String(body.totalAllocated);
    if (body.amountUsed !== undefined) updateValues.amountUsed = String(body.amountUsed);
    if (body.leftoverAmount !== undefined) updateValues.leftoverAmount = String(body.leftoverAmount);
    if (body.unit !== undefined) updateValues.unit = body.unit;
    if (body.deviceId !== undefined) updateValues.deviceId = body.deviceId;
    if (body.deviceModel !== undefined) updateValues.deviceModel = body.deviceModel;
    if (body.notes !== undefined) updateValues.notes = body.notes;

    if (Object.keys(updateValues).length === 0) {
      return badRequest("No valid fields to update");
    }

    const [updated] = await db
      .update(sessionConsumptionLogs)
      .set(updateValues)
      .where(and(eq(sessionConsumptionLogs.id, id), eq(sessionConsumptionLogs.tenantId, tenantId)))
      .returning();

    return success({
      ...updated,
      totalAllocated: updated.totalAllocated ? parseFloat(updated.totalAllocated) : null,
      amountUsed: updated.amountUsed ? parseFloat(updated.amountUsed) : null,
      leftoverAmount: updated.leftoverAmount ? parseFloat(updated.leftoverAmount) : null,
    });
  } catch (error) {
    console.error("PATCH /api/consumption/[id] error:", error);
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
      .from(sessionConsumptionLogs)
      .where(and(eq(sessionConsumptionLogs.id, id), eq(sessionConsumptionLogs.tenantId, tenantId)));

    if (!existing) return notFound("Consumption log not found");

    await db
      .delete(sessionConsumptionLogs)
      .where(and(eq(sessionConsumptionLogs.id, id), eq(sessionConsumptionLogs.tenantId, tenantId)));

    return success({ message: "Consumption log deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/consumption/[id] error:", error);
    return serverError();
  }
}
