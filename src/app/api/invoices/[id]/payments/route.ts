import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, payments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { recordPayment } from "@/lib/business-logic/finance";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "online", "wallet", "cheque"]),
  paymentDate: z.string(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  receiptNumber: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Verify invoice belongs to tenant
    const [invoice] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    if (!invoice) return notFound("Invoice not found");

    const paymentsList = await db
      .select()
      .from(payments)
      .where(and(eq(payments.invoiceId, id), eq(payments.tenantId, tenantId)))
      .orderBy(desc(payments.createdAt));

    return success(
      paymentsList.map((p) => ({
        ...p,
        amount: parseFloat(p.amount),
      }))
    );
  } catch (error) {
    console.error("GET /api/invoices/[id]/payments error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    // Verify invoice belongs to tenant
    const [invoice] = await db
      .select({ id: invoices.id, status: invoices.status })
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    if (!invoice) return notFound("Invoice not found");
    if (invoice.status === "void") return badRequest("Cannot record payment on a voided invoice");

    const payment = await recordPayment({
      tenantId,
      invoiceId: id,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod,
      paymentDate: parsed.data.paymentDate,
      referenceNumber: parsed.data.referenceNumber,
      notes: parsed.data.notes,
      receiptNumber: parsed.data.receiptNumber,
      createdBy: session.user.id,
    });

    return success(
      { ...payment, amount: parseFloat(payment.amount) },
      201
    );
  } catch (error) {
    console.error("POST /api/invoices/[id]/payments error:", error);
    return serverError();
  }
}
