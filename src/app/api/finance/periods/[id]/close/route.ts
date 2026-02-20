import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, notFound, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { financialPeriods, invoices, expenses } from "@/db/schema";
import { eq, and, gte, lte, sum } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [period] = await db
      .select()
      .from(financialPeriods)
      .where(and(eq(financialPeriods.id, id), eq(financialPeriods.tenantId, tenantId)));

    if (!period) return notFound("Period not found");
    if (period.status !== "open") return badRequest("Period is already closed");

    // Snapshot P&L totals
    const [revenueResult] = await db
      .select({ total: sum(invoices.total) })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, period.startDate),
          lte(invoices.date, period.endDate)
        )
      );

    const [expenseResult] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.status, "approved"),
          gte(expenses.date, period.startDate),
          lte(expenses.date, period.endDate)
        )
      );

    const revenue = parseFloat(revenueResult.total || "0");
    const totalExpenses = parseFloat(expenseResult.total || "0");
    const profit = revenue - totalExpenses;

    const [updated] = await db
      .update(financialPeriods)
      .set({
        status: "closed",
        snapshotRevenue: String(revenue),
        snapshotExpenses: String(totalExpenses),
        snapshotProfit: String(profit),
        closedBy: session.user.id,
        closedAt: new Date(),
      })
      .where(and(eq(financialPeriods.id, id), eq(financialPeriods.tenantId, tenantId)))
      .returning();

    return success({
      ...updated,
      snapshotRevenue: revenue,
      snapshotExpenses: totalExpenses,
      snapshotProfit: profit,
    });
  } catch (error) {
    console.error("POST /api/finance/periods/[id]/close error:", error);
    return serverError();
  }
}
