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
import { invoices, invoiceItems, appointments, transactions } from "@/db/schema";
import { invoiceSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import {
  createIncomeTransaction,
  createReversalTransaction,
  calculateEmployeeCommission,
} from "@/lib/business-logic/finance";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    if (!invoice) return notFound("Invoice not found");

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice.id));

    return success({
      ...invoice,
      subtotal: parseFloat(invoice.subtotal),
      taxRate: parseFloat(invoice.taxRate),
      taxAmount: parseFloat(invoice.taxAmount),
      total: parseFloat(invoice.total),
      items: items.map((item) => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice),
        discount: parseFloat(item.discount),
        total: parseFloat(item.total),
      })),
    });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = invoiceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;

    // Check existence
    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    if (!existing) return notFound("Invoice not found");

    // Build update values
    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.date !== undefined) updateValues.date = validated.date;
    if (validated.clientName !== undefined) updateValues.clientName = validated.clientName;
    if (validated.clientPhone !== undefined) updateValues.clientPhone = validated.clientPhone;
    if (validated.clientId !== undefined) updateValues.clientId = validated.clientId;
    if (validated.appointmentId !== undefined) updateValues.appointmentId = validated.appointmentId;
    if (validated.subtotal !== undefined) updateValues.subtotal = String(validated.subtotal);
    if (validated.taxRate !== undefined) updateValues.taxRate = String(validated.taxRate);
    if (validated.taxAmount !== undefined) updateValues.taxAmount = String(validated.taxAmount);
    if (validated.total !== undefined) updateValues.total = String(validated.total);
    if (validated.status !== undefined) updateValues.status = validated.status;
    if (validated.paymentMethod !== undefined) updateValues.paymentMethod = validated.paymentMethod;
    if (validated.notes !== undefined) updateValues.notes = validated.notes;

    const [updated] = await db
      .update(invoices)
      .set(updateValues)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)))
      .returning();

    // If items are provided, replace them
    if (validated.items && validated.items.length > 0) {
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      await db.insert(invoiceItems).values(
        validated.items.map((item: { description: string; quantity: number; unitPrice: number; discount: number; total: number }) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          discount: String(item.discount),
          total: String(item.total),
        }))
      );
    }

    // When invoice status changes to "paid", create income transaction and employee commission
    if (
      validated.status === "paid" &&
      existing.status !== "paid"
    ) {
      const invoiceTotal = parseFloat(updated.total);
      const invoiceDate = updated.date;

      // Create income transaction
      await createIncomeTransaction({
        tenantId,
        invoiceId: id,
        invoiceNumber: updated.invoiceNumber,
        total: invoiceTotal,
        date: invoiceDate,
        clientName: updated.clientName,
      });

      // If invoice is linked to an appointment, calculate employee commission
      if (updated.appointmentId) {
        const [appointment] = await db
          .select({ employeeId: appointments.employeeId })
          .from(appointments)
          .where(eq(appointments.id, updated.appointmentId));

        if (appointment?.employeeId) {
          await calculateEmployeeCommission({
            tenantId,
            employeeId: appointment.employeeId,
            invoiceId: id,
            invoiceTotal,
            date: invoiceDate,
          });
        }
      }
    }

    // When a paid invoice is voided, create a reversal transaction
    if (
      validated.status === "void" &&
      existing.status === "paid"
    ) {
      await createReversalTransaction({
        tenantId,
        invoiceId: id,
        invoiceNumber: updated.invoiceNumber,
        total: parseFloat(updated.total),
        date: updated.date,
        clientName: updated.clientName,
      });
    }

    logActivity({
      session,
      entityType: "invoice",
      entityId: id,
      action: "update",
      entityLabel: `${updated.invoiceNumber} - ${updated.clientName}`,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return success({
      ...updated,
      subtotal: parseFloat(updated.subtotal),
      taxRate: parseFloat(updated.taxRate),
      taxAmount: parseFloat(updated.taxAmount),
      total: parseFloat(updated.total),
      items: items.map((item) => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice),
        discount: parseFloat(item.discount),
        total: parseFloat(item.total),
      })),
    });
  } catch (error) {
    console.error("PATCH /api/invoices/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [existing] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    if (!existing) return notFound("Invoice not found");

    // Block deletion of paid invoices — must void instead
    if (existing.status === "paid") {
      return badRequest("Cannot delete a paid invoice. Void it instead.");
    }

    // Clean up any orphan transactions referencing this invoice
    await db.delete(transactions).where(eq(transactions.invoiceId, id));

    // Cascade delete: items are deleted via FK onDelete cascade
    await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, tenantId)));

    logActivity({
      session,
      entityType: "invoice",
      entityId: id,
      action: "delete",
      entityLabel: `${existing.invoiceNumber} - ${existing.clientName}`,
    });

    return success({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return serverError();
  }
}
