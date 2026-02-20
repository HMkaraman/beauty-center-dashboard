import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, serverError, success } from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, transactions, expenses, invoiceItems } from "@/db/schema";
import { eq, and, sql, gte, lte, sum, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || getFirstDayOfMonth();
    const endDate = url.searchParams.get("endDate") || getToday();

    // Previous period for delta calculation
    const periodDays = daysBetween(startDate, endDate);
    const prevEnd = subtractDays(startDate, 1);
    const prevStart = subtractDays(prevEnd, periodDays);

    // Current period revenue (paid invoices)
    const [revenueResult] = await db
      .select({ total: sum(invoices.total) })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      );

    // Previous period revenue
    const [prevRevenueResult] = await db
      .select({ total: sum(invoices.total) })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, prevStart),
          lte(invoices.date, prevEnd)
        )
      );

    // Current period expenses (approved)
    const [expenseResult] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.status, "approved"),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      );

    // Previous period expenses
    const [prevExpenseResult] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.status, "approved"),
          gte(expenses.date, prevStart),
          lte(expenses.date, prevEnd)
        )
      );

    // Tax collected (current period)
    const [taxResult] = await db
      .select({ total: sum(invoices.taxAmount) })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      );

    // Outstanding invoices (unpaid + partially_paid)
    const [outstandingResult] = await db
      .select({ total: sum(invoices.total), count: count() })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} IN ('unpaid', 'partially_paid')`
        )
      );

    // Invoice count current period
    const [invoiceCountResult] = await db
      .select({ count: count() })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      );

    // Revenue by service (top items from paid invoices)
    const revenueByService = await db
      .select({
        name: invoiceItems.description,
        value: sql<string>`SUM(CAST(${invoiceItems.total} AS numeric))`,
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      )
      .groupBy(invoiceItems.description)
      .orderBy(sql`SUM(CAST(${invoiceItems.total} AS numeric)) DESC`)
      .limit(6);

    // Monthly trend (last 12 months)
    const monthlyTrend = await db
      .select({
        month: sql<string>`TO_CHAR(TO_DATE(${transactions.date}, 'YYYY-MM-DD'), 'YYYY-MM')`,
        income: sql<string>`SUM(CASE WHEN ${transactions.type} = 'income' AND CAST(${transactions.amount} AS numeric) > 0 THEN CAST(${transactions.amount} AS numeric) ELSE 0 END)`,
        expense: sql<string>`SUM(CASE WHEN ${transactions.type} = 'expense' THEN ABS(CAST(${transactions.amount} AS numeric)) ELSE 0 END)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, tenantId),
          gte(transactions.date, getMonthsAgo(12))
        )
      )
      .groupBy(sql`TO_CHAR(TO_DATE(${transactions.date}, 'YYYY-MM-DD'), 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(TO_DATE(${transactions.date}, 'YYYY-MM-DD'), 'YYYY-MM')`);

    // Expense breakdown by category
    const expenseBreakdown = await db
      .select({
        name: expenses.category,
        value: sql<string>`SUM(CAST(${expenses.amount} AS numeric))`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.status, "approved"),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .groupBy(expenses.category)
      .orderBy(sql`SUM(CAST(${expenses.amount} AS numeric)) DESC`)
      .limit(8);

    const revenue = parseFloat(revenueResult.total || "0");
    const prevRevenue = parseFloat(prevRevenueResult.total || "0");
    const totalExpenses = parseFloat(expenseResult.total || "0");
    const prevExpenses = parseFloat(prevExpenseResult.total || "0");
    const netProfit = revenue - totalExpenses;
    const prevNetProfit = prevRevenue - prevExpenses;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#6d28d9"];

    return success({
      revenue,
      revenueChange: calcChange(revenue, prevRevenue),
      expenses: totalExpenses,
      expensesChange: calcChange(totalExpenses, prevExpenses),
      netProfit,
      netProfitChange: calcChange(netProfit, prevNetProfit),
      margin: Math.round(margin * 100) / 100,
      taxCollected: parseFloat(taxResult.total || "0"),
      outstandingAmount: parseFloat(outstandingResult.total || "0"),
      outstandingCount: outstandingResult.count,
      invoiceCount: invoiceCountResult.count,
      revenueByService: revenueByService.map((r, i) => ({
        name: r.name,
        value: parseFloat(r.value || "0"),
        color: colors[i % colors.length],
      })),
      monthlyTrend: monthlyTrend.map((m) => ({
        name: m.month,
        revenue: parseFloat(m.income || "0"),
        expenses: parseFloat(m.expense || "0"),
      })),
      expenseBreakdown: expenseBreakdown.map((e, i) => ({
        name: e.name,
        value: parseFloat(e.value || "0"),
        color: colors[i % colors.length],
      })),
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error("GET /api/finance/overview error:", error);
    return serverError();
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getFirstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().split("T")[0];
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

function subtractDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 10000) / 100;
}
