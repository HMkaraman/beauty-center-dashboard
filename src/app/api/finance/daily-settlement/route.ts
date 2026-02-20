import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { dailySettlements, invoices, expenses } from "@/db/schema";
import { eq, and, sql, sum } from "drizzle-orm";
import { z } from "zod";

const settlementSchema = z.object({
  date: z.string(),
  openingBalance: z.number().default(0),
  actualCash: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const date = url.searchParams.get("date");

    const conditions = [eq(dailySettlements.tenantId, tenantId)];
    if (date) {
      conditions.push(eq(dailySettlements.date, date));
    }

    const settlements = await db
      .select()
      .from(dailySettlements)
      .where(and(...conditions))
      .orderBy(sql`${dailySettlements.date} DESC`)
      .limit(30);

    return success(
      settlements.map((s) => ({
        ...s,
        openingBalance: parseFloat(s.openingBalance),
        cashSales: parseFloat(s.cashSales),
        cardSales: parseFloat(s.cardSales),
        bankTransferSales: parseFloat(s.bankTransferSales),
        cashExpenses: parseFloat(s.cashExpenses),
        expectedCash: parseFloat(s.expectedCash),
        actualCash: s.actualCash ? parseFloat(s.actualCash) : null,
        discrepancy: s.discrepancy ? parseFloat(s.discrepancy) : null,
      }))
    );
  } catch (error) {
    console.error("GET /api/finance/daily-settlement error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const body = await req.json();
    const parsed = settlementSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const date = parsed.data.date;

    // Calculate sales by payment method for the day
    const salesByMethod = await db
      .select({
        paymentMethod: invoices.paymentMethod,
        total: sum(invoices.total),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.date, date),
          eq(invoices.status, "paid")
        )
      )
      .groupBy(invoices.paymentMethod);

    let cashSales = 0;
    let cardSales = 0;
    let bankTransferSales = 0;

    for (const s of salesByMethod) {
      const amount = parseFloat(s.total || "0");
      switch (s.paymentMethod) {
        case "cash": cashSales = amount; break;
        case "card": cardSales = amount; break;
        case "bank_transfer": bankTransferSales = amount; break;
      }
    }

    // Calculate cash expenses for the day
    const [expenseResult] = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.date, date),
          eq(expenses.status, "approved"),
          eq(expenses.paymentMethod, "cash")
        )
      );

    const cashExpenses = parseFloat(expenseResult.total || "0");
    const openingBalance = parsed.data.openingBalance;
    const expectedCash = openingBalance + cashSales - cashExpenses;

    const actualCash = parsed.data.actualCash;
    const discrepancy = actualCash != null ? actualCash - expectedCash : null;
    const status = actualCash != null ? "closed" : "open";

    const [settlement] = await db
      .insert(dailySettlements)
      .values({
        tenantId,
        date,
        openingBalance: String(openingBalance),
        cashSales: String(cashSales),
        cardSales: String(cardSales),
        bankTransferSales: String(bankTransferSales),
        cashExpenses: String(cashExpenses),
        expectedCash: String(expectedCash),
        actualCash: actualCash != null ? String(actualCash) : null,
        discrepancy: discrepancy != null ? String(discrepancy) : null,
        closedBy: status === "closed" ? session.user.id : null,
        status,
        notes: parsed.data.notes,
      })
      .returning();

    return success(
      {
        ...settlement,
        openingBalance: parseFloat(settlement.openingBalance),
        cashSales: parseFloat(settlement.cashSales),
        cardSales: parseFloat(settlement.cardSales),
        bankTransferSales: parseFloat(settlement.bankTransferSales),
        cashExpenses: parseFloat(settlement.cashExpenses),
        expectedCash: parseFloat(settlement.expectedCash),
        actualCash: settlement.actualCash ? parseFloat(settlement.actualCash) : null,
        discrepancy: settlement.discrepancy ? parseFloat(settlement.discrepancy) : null,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/finance/daily-settlement error:", error);
    return serverError();
  }
}
