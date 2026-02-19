import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments, invoices } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const today = new Date().toISOString().split("T")[0];

    const [totalResult, waitingResult, inProgressResult, completedResult, revenueResult] = await Promise.all([
      db
        .select({ total: count() })
        .from(appointments)
        .where(and(eq(appointments.tenantId, tenantId), eq(appointments.date, today))),
      db
        .select({ total: count() })
        .from(appointments)
        .where(and(eq(appointments.tenantId, tenantId), eq(appointments.date, today), eq(appointments.status, "waiting"))),
      db
        .select({ total: count() })
        .from(appointments)
        .where(and(eq(appointments.tenantId, tenantId), eq(appointments.date, today), eq(appointments.status, "in-progress"))),
      db
        .select({ total: count() })
        .from(appointments)
        .where(and(eq(appointments.tenantId, tenantId), eq(appointments.date, today), eq(appointments.status, "completed"))),
      db
        .select({
          total: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            eq(invoices.date, today),
            eq(invoices.status, "paid")
          )
        ),
    ]);

    return success({
      totalAppointments: totalResult[0]?.total ?? 0,
      waiting: waitingResult[0]?.total ?? 0,
      inProgress: inProgressResult[0]?.total ?? 0,
      completed: completedResult[0]?.total ?? 0,
      todayRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
    });
  } catch (error) {
    console.error("GET /api/reception/stats error:", error);
    return serverError();
  }
}
