import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, appointments, clients, expenses } from "@/db/schema";
import { eq, and, sql, count, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    // Build date filter conditions for each table
    const invoiceDateFilters = [
      eq(invoices.tenantId, tenantId),
      eq(invoices.status, "paid"),
      ...(from ? [gte(invoices.createdAt, new Date(from))] : []),
      ...(to ? [lte(invoices.createdAt, new Date(to))] : []),
    ];

    const appointmentDateFilters = [
      eq(appointments.tenantId, tenantId),
      ...(from ? [gte(appointments.createdAt, new Date(from))] : []),
      ...(to ? [lte(appointments.createdAt, new Date(to))] : []),
    ];

    const clientDateFilters = [
      eq(clients.tenantId, tenantId),
      ...(from ? [gte(clients.createdAt, new Date(from))] : []),
      ...(to ? [lte(clients.createdAt, new Date(to))] : []),
    ];

    const expenseDateFilters = [
      eq(expenses.tenantId, tenantId),
      eq(expenses.status, "approved"),
      ...(from ? [gte(expenses.createdAt, new Date(from))] : []),
      ...(to ? [lte(expenses.createdAt, new Date(to))] : []),
    ];

    // Run all aggregation queries in parallel
    const [revenueResult, appointmentsResult, clientsResult, expensesResult] =
      await Promise.all([
        // Total revenue: SUM of invoices.total WHERE status = 'paid'
        db
          .select({
            totalRevenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
          })
          .from(invoices)
          .where(and(...invoiceDateFilters)),

        // Total appointments: COUNT
        db
          .select({ total: count() })
          .from(appointments)
          .where(and(...appointmentDateFilters)),

        // Total clients: COUNT
        db
          .select({ total: count() })
          .from(clients)
          .where(and(...clientDateFilters)),

        // Total expenses: SUM of expenses.amount WHERE status = 'approved'
        db
          .select({
            totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
          })
          .from(expenses)
          .where(and(...expenseDateFilters)),
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
