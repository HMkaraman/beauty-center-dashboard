import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, appointments, clients, expenses } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    // Run all aggregation queries in parallel
    const [revenueResult, appointmentsResult, clientsResult, expensesResult] =
      await Promise.all([
        // Total revenue: SUM of invoices.total WHERE status = 'paid'
        db
          .select({
            totalRevenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
          })
          .from(invoices)
          .where(
            and(
              eq(invoices.tenantId, tenantId),
              eq(invoices.status, "paid")
            )
          ),

        // Total appointments: COUNT
        db
          .select({ total: count() })
          .from(appointments)
          .where(eq(appointments.tenantId, tenantId)),

        // Total clients: COUNT
        db
          .select({ total: count() })
          .from(clients)
          .where(eq(clients.tenantId, tenantId)),

        // Total expenses: SUM of expenses.amount WHERE status = 'approved'
        db
          .select({
            totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.tenantId, tenantId),
              eq(expenses.status, "approved")
            )
          ),
      ]);

    return success({
      totalRevenue: parseFloat(revenueResult[0].totalRevenue),
      totalAppointments: appointmentsResult[0].total,
      totalClients: clientsResult[0].total,
      totalExpenses: parseFloat(expensesResult[0].totalExpenses),
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return serverError();
  }
}
