import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, serverError, success } from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, invoiceItems } from "@/db/schema";
import { eq, and, gte, lte, sql, sum, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || getFirstDayOfQuarter();
    const endDate = url.searchParams.get("endDate") || getToday();

    // Output VAT (collected on sales) — from paid invoices
    const [outputVat] = await db
      .select({
        taxableAmount: sum(invoices.subtotal),
        vatAmount: sum(invoices.taxAmount),
        invoiceCount: count(),
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

    // VAT breakdown by tax category (from invoice items)
    const vatByCategory = await db
      .select({
        taxCategory: invoiceItems.taxCategory,
        taxRate: invoiceItems.taxRate,
        taxableAmount: sql<string>`SUM(CAST(${invoiceItems.total} AS numeric))`,
        vatAmount: sql<string>`SUM(CAST(${invoiceItems.taxAmount} AS numeric))`,
        itemCount: count(),
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
      .groupBy(invoiceItems.taxCategory, invoiceItems.taxRate);

    // Monthly breakdown
    const monthlyBreakdown = await db
      .select({
        month: sql<string>`TO_CHAR(TO_DATE(${invoices.date}, 'YYYY-MM-DD'), 'YYYY-MM')`,
        taxableAmount: sql<string>`SUM(CAST(${invoices.subtotal} AS numeric))`,
        vatAmount: sql<string>`SUM(CAST(${invoices.taxAmount} AS numeric))`,
        invoiceCount: count(),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, "paid"),
          gte(invoices.date, startDate),
          lte(invoices.date, endDate)
        )
      )
      .groupBy(sql`TO_CHAR(TO_DATE(${invoices.date}, 'YYYY-MM-DD'), 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(TO_DATE(${invoices.date}, 'YYYY-MM-DD'), 'YYYY-MM')`);

    const categoryLabels: Record<string, { ar: string; en: string }> = {
      S: { ar: "خاضع للضريبة (معدل قياسي)", en: "Standard Rate" },
      Z: { ar: "خاضع بنسبة صفر", en: "Zero-Rated" },
      E: { ar: "معفى من الضريبة", en: "Exempt" },
      O: { ar: "خارج نطاق الضريبة", en: "Out of Scope" },
    };

    const totalOutputVat = parseFloat(outputVat.vatAmount || "0");

    return success({
      period: { startDate, endDate },
      outputVat: {
        taxableAmount: parseFloat(outputVat.taxableAmount || "0"),
        vatAmount: totalOutputVat,
        invoiceCount: outputVat.invoiceCount,
      },
      netVatPayable: totalOutputVat,
      byCategory: vatByCategory.map((c) => ({
        category: c.taxCategory || "S",
        categoryLabel: categoryLabels[c.taxCategory || "S"] || categoryLabels.S,
        taxRate: parseFloat(c.taxRate || "15"),
        taxableAmount: parseFloat(c.taxableAmount || "0"),
        vatAmount: parseFloat(c.vatAmount || "0"),
        itemCount: c.itemCount,
      })),
      monthly: monthlyBreakdown.map((m) => ({
        month: m.month,
        taxableAmount: parseFloat(m.taxableAmount || "0"),
        vatAmount: parseFloat(m.vatAmount || "0"),
        invoiceCount: m.invoiceCount,
      })),
    });
  } catch (error) {
    console.error("GET /api/finance/reports/tax-summary error:", error);
    return serverError();
  }
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getFirstDayOfQuarter(): string {
  const d = new Date();
  const quarter = Math.floor(d.getMonth() / 3);
  return `${d.getFullYear()}-${String(quarter * 3 + 1).padStart(2, "0")}-01`;
}
