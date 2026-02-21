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
  calculateDoctorCommission,
} from "@/lib/business-logic/finance";
import { logActivity, buildRelatedEntities, buildCreateChanges } from "@/lib/activity-logger";
import { triggerNotification } from "@/lib/notification-events";

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
          taxRate: item.taxRate ? parseFloat(item.taxRate) : undefined,
          taxAmount: item.taxAmount ? parseFloat(item.taxAmount) : undefined,
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
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));

    const invoiceType = validated.invoiceType || "standard";
    const isCreditNote = invoiceType === "credit_note";
    const isDebitNote = invoiceType === "debit_note";
    let invoiceNumber: string;

    if (isCreditNote) {
      const nextCn = settings?.nextCreditNoteNumber ?? 1;
      invoiceNumber = `CN-${String(nextCn).padStart(5, "0")}`;
      if (settings) {
        await db.update(tenantSettings).set({ nextCreditNoteNumber: nextCn + 1, updatedAt: new Date() }).where(eq(tenantSettings.tenantId, tenantId));
      }
    } else if (isDebitNote) {
      const nextNum = settings?.nextInvoiceNumber ?? 1;
      invoiceNumber = `DN-${String(nextNum).padStart(5, "0")}`;
      if (settings) {
        await db.update(tenantSettings).set({ nextInvoiceNumber: nextNum + 1, updatedAt: new Date() }).where(eq(tenantSettings.tenantId, tenantId));
      }
    } else {
      const nextNum = settings?.nextInvoiceNumber ?? 1;
      const prefix = settings?.invoicePrefix || "INV";
      invoiceNumber = `${prefix}-${String(nextNum).padStart(5, "0")}`;
      if (settings) {
        await db.update(tenantSettings).set({ nextInvoiceNumber: nextNum + 1, updatedAt: new Date() }).where(eq(tenantSettings.tenantId, tenantId));
      } else {
        await db.insert(tenantSettings).values({ tenantId, nextInvoiceNumber: 2 });
      }
    }

    // Determine invoice type code for ZATCA
    const invoiceTypeCode = isCreditNote ? "381" : isDebitNote ? "383" : "388";

    // Generate e-invoicing artifacts if enabled
    let qrCode: string | undefined;
    let xmlContent: string | undefined;
    let zatcaStatus: string | undefined;
    const eInvoicingEnabled = settings?.eInvoicingEnabled === 1;

    if (eInvoicingEnabled && settings?.taxRegistrationNumber) {
      const { generateZatcaQrCode } = await import("@/lib/zatca/qr-code");
      const { generateZatcaXml } = await import("@/lib/zatca/xml-generator");

      const now = new Date();
      qrCode = generateZatcaQrCode({
        sellerName: settings.businessName || "",
        vatNumber: settings.taxRegistrationNumber,
        timestamp: now.toISOString(),
        totalWithVat: String(validated.total),
        vatAmount: String(validated.taxAmount),
      });

      xmlContent = generateZatcaXml({
        uuid: crypto.randomUUID(),
        invoiceNumber,
        issueDate: validated.date,
        issueTime: now.toTimeString().split(" ")[0],
        invoiceTypeCode,
        sellerName: settings.businessName || "",
        sellerTrn: settings.taxRegistrationNumber,
        sellerAddress: settings.businessAddress || undefined,
        sellerPhone: settings.businessPhone || undefined,
        buyerName: validated.buyerName,
        buyerTrn: validated.buyerTrn,
        buyerAddress: validated.buyerAddress,
        subtotal: validated.subtotal,
        discountTotal: validated.discountTotal || 0,
        taxableAmount: validated.subtotal - (validated.discountTotal || 0),
        taxAmount: validated.taxAmount,
        total: validated.total,
        currency: validated.currency || settings.currency || "SAR",
        items: validated.items.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxCategory: item.taxCategory || "S",
          taxRate: item.taxRate ?? validated.taxRate,
          taxAmount: item.taxAmount ?? 0,
          lineTotal: item.total,
        })),
      });

      zatcaStatus = "pending";
    }

    // Insert invoice and items
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
        invoiceType: invoiceType,
        invoiceTypeCode,
        originalInvoiceId: validated.originalInvoiceId,
        buyerTrn: validated.buyerTrn,
        buyerName: validated.buyerName,
        buyerAddress: validated.buyerAddress,
        currency: validated.currency,
        discountTotal: validated.discountTotal != null ? String(validated.discountTotal) : undefined,
        qrCode,
        xmlContent,
        zatcaStatus,
        issuedAt: new Date(),
      })
      .returning();

    // Insert invoice items
    if (validated.items.length > 0) {
      await db.insert(invoiceItems).values(
        validated.items.map((item: { description: string; quantity: number; unitPrice: number; discount: number; total: number; serviceId?: string; taxCategory?: string; taxRate?: number; taxAmount?: number }) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          discount: String(item.discount),
          total: String(item.total),
          serviceId: item.serviceId,
          taxCategory: item.taxCategory || "S",
          taxRate: item.taxRate != null ? String(item.taxRate) : undefined,
          taxAmount: item.taxAmount != null ? String(item.taxAmount) : undefined,
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
          .select({ employeeId: appointments.employeeId, doctorId: appointments.doctorId })
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

        if (appointment?.doctorId) {
          await calculateDoctorCommission({
            tenantId,
            doctorId: appointment.doctorId,
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

    // Build related entities for cross-entity visibility
    const invoiceRelatedRefs: Record<string, string | null | undefined> = {
      clientId: validated.clientId,
    };
    if (validated.appointmentId) {
      const [linkedAppt] = await db
        .select({ employeeId: appointments.employeeId, doctorId: appointments.doctorId })
        .from(appointments)
        .where(eq(appointments.id, validated.appointmentId));
      if (linkedAppt) {
        invoiceRelatedRefs.employeeId = linkedAppt.employeeId;
        invoiceRelatedRefs.doctorId = linkedAppt.doctorId;
      }
    }

    logActivity({
      session,
      entityType: "invoice",
      entityId: newInvoice.id,
      action: "create",
      entityLabel: `${invoiceNumber} - ${validated.clientName}`,
      changes: buildCreateChanges({
        invoiceNumber,
        clientName: validated.clientName,
        date: validated.date,
        total: validated.total,
        status: validated.status,
        paymentMethod: validated.paymentMethod,
      }),
      relatedEntities: buildRelatedEntities(invoiceRelatedRefs),
    });

    triggerNotification({
      eventKey: "invoice_created",
      tenantId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "invoice",
      entityId: newInvoice.id,
      context: {
        invoiceNumber,
        clientName: validated.clientName,
        total: String(validated.total),
      },
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
          taxRate: item.taxRate ? parseFloat(item.taxRate) : undefined,
          taxAmount: item.taxAmount ? parseFloat(item.taxAmount) : undefined,
        })),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return serverError();
  }
}
