import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { success, unauthorized, serverError } from "@/lib/api-utils";
import { getClientFromToken } from "@/lib/client-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getClientFromToken(req.headers.get("authorization"));
    if (!auth) return unauthorized();

    const { clientId, tenantId } = auth;
    const today = new Date().toISOString().split("T")[0];

    // Get upcoming appointments (date >= today)
    const upcoming = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clientId, clientId),
          eq(appointments.tenantId, tenantId),
          gte(appointments.date, today)
        )
      )
      .orderBy(appointments.date, appointments.time);

    // Get past appointments (date < today)
    const past = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clientId, clientId),
          eq(appointments.tenantId, tenantId),
          lt(appointments.date, today)
        )
      )
      .orderBy(appointments.date, appointments.time);

    return success({ upcoming, past });
  } catch (error) {
    console.error("GET /api/public/portal/appointments error:", error);
    return serverError();
  }
}
