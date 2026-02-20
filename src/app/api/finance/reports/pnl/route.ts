import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, serverError, success } from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, expenses, transactions, accounts } from "@/db/schema";
import { eq, and, gte, lte, sql, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || getFirstDayOfMonth();
    const endDate = url.searchParams.get("endDate") || getToday();

    // Revenue: sum of paid invoices
    const [revenueResult] = await db
      .select({
        subtotal: sum(invoices.subtotal),
        taxAmount: sum(invoices.taxAmount),
        total: sum(invoices.total),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      );

    // Revenue breakdown by account (if transactions have accountIds)
    const revenueByAccount = await db
      .select({
        accountId: transactions.accountId,
        total: sql<string>`SUM(CAST(${transactions.amount} AS numeric))`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, tenantId),
          eq(transactions.type, "income"),
          sql`CAST(${transactions.amount} AS numeric) > 0`,
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .groupBy(transactions.accountId);

    // Expense breakdown by category
    const expensesByCategory = await db
      .select({
        category: expenses.category,
        total: sql<string>`SUM(CAST(${expenses.amount} AS numeric))`,
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
      .orderBy(sql`SUM(CAST(${expenses.amount} AS numeric)) DESC`);

    // Get account names for mapping
    const accountsList = await db
      .select({ id: accounts.id, code: accounts.code, name: accounts.name, nameEn: accounts.nameEn, type: accounts.type })
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId));

    const accountMap = new Map(accountsList.map((a) => [a.id, a]));

    const grossRevenue = parseFloat(revenueResult.subtotal || "0");
    const taxCollected = parseFloat(revenueResult.taxAmount || "0");
    const totalRevenue = parseFloat(revenueResult.total || "0");

    const totalExpenses = expensesByCategory.reduce((sum, e) => sum + parseFloat(e.total || "0"), 0);
    const netProfit = grossRevenue - totalExpenses;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Build structured P&L
    const revenueLines = revenueByAccount.map((r) => {
      const account = r.accountId ? accountMap.get(r.accountId) : null;
      return {
        code: account?.code || "4000",
        name: account?.name || "إيرادات الخدمات",
        nameEn: account?.nameEn || "Service Revenue",
        amount: parseFloat(r.total || "0"),
      };
    });

    // If no account-linked revenue, show as single line
    if (revenueLines.length === 0 && grossRevenue > 0) {
      revenueLines.push({
        code: "4000",
        name: "إيرادات الخدمات",
        nameEn: "Service Revenue",
        amount: grossRevenue,
      });
    }

    const expenseLines = expensesByCategory.map((e) => ({
      code: "",
      name: e.category,
      nameEn: e.category,
      amount: parseFloat(e.total || "0"),
    }));

    return success({
      period: { startDate, endDate },
      revenue: {
        lines: revenueLines,
        total: grossRevenue,
      },
      taxCollected,
      totalRevenue,
      expenses: {
        lines: expenseLines,
        total: totalExpenses,
      },
      netProfit,
      margin: Math.round(margin * 100) / 100,
    });
  } catch (error) {
    console.error("GET /api/finance/reports/pnl error:", error);
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
