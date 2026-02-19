import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  getPaginationParams,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { invoices, invoiceItems, tenantSettings, appointments } from "@/db/schema";
import { invoiceSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import {
  createIncomeTransaction,
  calculateEmployeeCommission,
} from "@/lib/business-logic/finance";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(invoices.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(invoices.clientName, `%${search}%`)} OR ${ilike(invoices.invoiceNumber, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(invoices)
      .where(whereClause);

    const rows = await db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch items for all invoices in this page
    const invoiceIds = rows.map((r) => r.id);
    const items =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(invoiceItems)
            .where(sql`${invoiceItems.invoiceId} IN ${invoiceIds}`)
        : [];

    const data = rows.map((inv) => ({
      ...inv,
      subtotal: parseFloat(inv.subtotal),
      taxRate: parseFloat(inv.taxRate),
      taxAmount: parseFloat(inv.taxAmount),
      total: parseFloat(inv.total),
      items: items
        .filter((item) => item.invoiceId === inv.id)
        .map((item) => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          discount: parseFloat(item.discount),
          total: parseFloat(item.total),
        })),
    }));

    return success({
      data,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    // Generate sequential invoice number from tenant settings
    const [settings] = await db
      .select({ nextInvoiceNumber: tenantSettings.nextInvoiceNumber })
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));

    let nextNum = settings?.nextInvoiceNumber ?? 1;
    const invoiceNumber = `INV-${String(nextNum).padStart(5, "0")}`;

    // Increment the counter
    if (settings) {
      await db
        .update(tenantSettings)
        .set({ nextInvoiceNumber: nextNum + 1, updatedAt: new Date() })
        .where(eq(tenantSettings.tenantId, tenantId));
    } else {
      await db.insert(tenantSettings).values({
        tenantId,
        nextInvoiceNumber: 2,
      });
    }

    // Insert invoice and items in a conceptual transaction
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        tenantId,
        invoiceNumber,
        date: validated.date,
        clientId: validated.clientId,
        clientName: validated.clientName,
        clientPhone: validated.clientPhone,
        appointmentId: validated.appointmentId,
        subtotal: String(validated.subtotal),
        taxRate: String(validated.taxRate),
        taxAmount: String(validated.taxAmount),
        total: String(validated.total),
        status: validated.status,
        paymentMethod: validated.paymentMethod,
        notes: validated.notes,
      })
      .returning();

    // Insert invoice items
    if (validated.items.length > 0) {
      await db.insert(invoiceItems).values(
        validated.items.map((item: { description: string; quantity: number; unitPrice: number; discount: number; total: number }) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          discount: String(item.discount),
          total: String(item.total),
        }))
      );
    }

    // When invoice is created as "paid" (checkout flow), create income transaction + commission
    if (validated.status === "paid") {
      const invoiceTotal = parseFloat(newInvoice.total);

      await createIncomeTransaction({
        tenantId,
        invoiceId: newInvoice.id,
        invoiceNumber,
        total: invoiceTotal,
        date: validated.date,
        clientName: validated.clientName,
      });

      if (validated.appointmentId) {
        const [appointment] = await db
          .select({ employeeId: appointments.employeeId })
          .from(appointments)
          .where(eq(appointments.id, validated.appointmentId));

        if (appointment?.employeeId) {
          await calculateEmployeeCommission({
            tenantId,
            employeeId: appointment.employeeId,
            invoiceId: newInvoice.id,
            invoiceTotal,
            date: validated.date,
          });
        }
      }
    }

    // Fetch created items
    const createdItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, newInvoice.id));

    logActivity({
      session,
      entityType: "invoice",
      entityId: newInvoice.id,
      action: "create",
      entityLabel: `${invoiceNumber} - ${validated.clientName}`,
    });

    return success(
      {
        ...newInvoice,
        subtotal: parseFloat(newInvoice.subtotal),
        taxRate: parseFloat(newInvoice.taxRate),
        taxAmount: parseFloat(newInvoice.taxAmount),
        total: parseFloat(newInvoice.total),
        items: createdItems.map((item) => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          discount: parseFloat(item.discount),
          total: parseFloat(item.total),
        })),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return serverError();
  }
}
