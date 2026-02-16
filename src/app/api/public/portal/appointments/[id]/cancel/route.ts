import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  success,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from "@/lib/api-utils";
import { getClientFromToken } from "@/lib/client-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getClientFromToken(req.headers.get("authorization"));
    if (!auth) return unauthorized();

    const { id } = await params;
    const { clientId, tenantId } = auth;

    // Find the appointment
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.clientId, clientId),
          eq(appointments.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!appointment) {
      return notFound("Appointment not found");
    }

    // Check if appointment is in the future
    const today = new Date().toISOString().split("T")[0];
    if (appointment.date < today) {
      return badRequest("Cannot cancel past appointments");
    }

    // Check if already cancelled
    if (appointment.status === "cancelled") {
      return badRequest("Appointment is already cancelled");
    }

    // Cancel the appointment
    await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(appointments.id, id));

    return success({ success: true });
  } catch (error) {
    console.error(
      "POST /api/public/portal/appointments/[id]/cancel error:",
      error
    );
    return serverError();
  }
}
