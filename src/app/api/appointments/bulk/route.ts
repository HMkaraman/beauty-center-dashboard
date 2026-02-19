import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { logActivity, buildRelatedEntities } from "@/lib/activity-logger";

const VALID_STATUSES = ["confirmed", "pending", "cancelled", "completed", "no-show"];

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();
    const body = await req.json();
    const { ids, status } = body;
    if (!Array.isArray(ids) || ids.length === 0) return badRequest("ids must be a non-empty array");
    if (!status || !VALID_STATUSES.includes(status)) return badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);

    // Fetch existing appointments before update for logging
    const existing = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids)));

    const updated = await db
      .update(appointments)
      .set({ status })
      .where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids)))
      .returning({ id: appointments.id });

    // Log activity for each affected appointment
    for (const appt of existing) {
      if (appt.status !== status) {
        logActivity({
          session,
          entityType: "appointment",
          entityId: appt.id,
          action: "update",
          entityLabel: `${appt.clientName} - ${appt.service}`,
          changes: { status: { old: appt.status, new: status } },
          relatedEntities: buildRelatedEntities({
            clientId: appt.clientId,
            employeeId: appt.employeeId,
            doctorId: appt.doctorId,
          }),
        });
      }
    }

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

    // Fetch existing appointments before deletion for logging
    const existing = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids)));

    const deleted = await db
      .delete(appointments)
      .where(and(eq(appointments.tenantId, session.user.tenantId), inArray(appointments.id, ids)))
      .returning({ id: appointments.id });

    // Log activity for each deleted appointment
    for (const appt of existing) {
      logActivity({
        session,
        entityType: "appointment",
        entityId: appt.id,
        action: "delete",
        entityLabel: `${appt.clientName} - ${appt.service}`,
        relatedEntities: buildRelatedEntities({
          clientId: appt.clientId,
          employeeId: appt.employeeId,
          doctorId: appt.doctorId,
        }),
      });
    }

    return success({ deleted: deleted.length });
  } catch (error) {
    console.error("DELETE /api/appointments/bulk error:", error);
    return serverError();
  }
}
