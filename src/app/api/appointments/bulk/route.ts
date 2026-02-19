import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

const VALID_STATUSES = ["confirmed", "pending", "cancelled", "completed", "no-show"];

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const { ids, status } = body;
    if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids must be a non-empty array");
    if (!status || !VALID_STATUSES.includes(status)) return badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    const updated = await db.update(appointments).set({ status }).where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids))).returning({ id: appointments.id });
    return success({ updated: updated.length });
  } catch (error) {
    console.error("PATCH /api/appointments/bulk error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const ids: string[] = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("ids must be a non-empty array");
    }

    const deleted = await db
      .delete(appointments)
      .where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids)))
      .returning({ id: appointments.id });

    return success({ deleted: deleted.length });
  } catch (error) {
    console.error("DELETE /api/appointments/bulk error:", error);
    return serverError();
  }
}
