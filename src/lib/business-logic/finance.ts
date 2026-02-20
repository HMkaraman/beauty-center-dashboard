import { db } from "@/db/db";
import { transactions, employees, invoices, payments, doctors, doctorCommissions, tenantSettings } from "@/db/schema";
import { employeeCommissions } from "@/db/schema";
import { eq, and, sql, sum } from "drizzle-orm";

// Create income transaction when invoice is paid
export async function createIncomeTransaction(params: {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  total: number;
  date: string;
  clientName: string;
  accountId?: string;
}) {
  // Try to find Service Revenue account for this tenant
  let accountId = params.accountId;
  if (!accountId) {
    const { accounts } = await import("@/db/schema");
    const [serviceRevenueAccount] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.tenantId, params.tenantId), eq(accounts.code, "4000")))
      .limit(1);
    accountId = serviceRevenueAccount?.id;
  }

  await db.insert(transactions).values({
    tenantId: params.tenantId,
    date: params.date,
    description: `Invoice ${params.invoiceNumber} - ${params.clientName}`,
    category: "خدمات", // Services
    type: "income",
    amount: String(params.total),
    invoiceId: params.invoiceId,
    accountId,
  });
}

// Create expense transaction when expense is approved
export async function createExpenseTransaction(params: {
  tenantId: string;
  expenseId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  categoryId?: string;
}) {
  // Try to find matching account from expense category code
  let accountId: string | undefined;
  if (params.categoryId) {
    const { expenseCategories, accounts: accountsTable } = await import("@/db/schema");
    const [cat] = await db
      .select({ code: expenseCategories.code })
      .from(expenseCategories)
      .where(eq(expenseCategories.id, params.categoryId))
      .limit(1);
    if (cat?.code) {
      const [account] = await db
        .select({ id: accountsTable.id })
        .from(accountsTable)
        .where(and(eq(accountsTable.tenantId, params.tenantId), eq(accountsTable.code, cat.code)))
        .limit(1);
      accountId = account?.id;
    }
  }

  await db.insert(transactions).values({
    tenantId: params.tenantId,
    date: params.date,
    description: params.description,
    category: params.category,
    type: "expense",
    amount: String(params.amount),
    expenseId: params.expenseId,
    accountId,
  });
}

// Create reversal transaction when a paid invoice is voided
export async function createReversalTransaction(params: {
  tenantId: string;
  invoiceId: string;
  invoiceNumber: string;
  total: number;
  date: string;
  clientName: string;
}) {
  await db.insert(transactions).values({
    tenantId: params.tenantId,
    date: params.date,
    description: `Void: Invoice ${params.invoiceNumber} - ${params.clientName}`,
    category: "خدمات", // Services
    type: "income",
    amount: String(-params.total),
    invoiceId: params.invoiceId,
  });
}

// Calculate and record employee commission when invoice is paid
export async function calculateEmployeeCommission(params: {
  tenantId: string;
  employeeId: string;
  invoiceId: string;
  invoiceTotal: number;
  date: string;
}) {
  // Get employee commission rate
  const [employee] = await db
    .select({ commissionRate: employees.commissionRate })
    .from(employees)
    .where(eq(employees.id, params.employeeId));

  if (!employee?.commissionRate) return;

  const rate = parseFloat(employee.commissionRate);
  if (rate <= 0) return;

  const commissionAmount = (params.invoiceTotal * rate) / 100;

  await db.insert(employeeCommissions).values({
    tenantId: params.tenantId,
    employeeId: params.employeeId,
    invoiceId: params.invoiceId,
    amount: String(commissionAmount),
    rate: employee.commissionRate,
    date: params.date,
  });
}

// Calculate and record doctor commission when invoice is paid
export async function calculateDoctorCommission(params: {
  tenantId: string;
  doctorId: string;
  invoiceId: string;
  invoiceTotal: number;
  date: string;
}) {
  const [doctor] = await db
    .select({ commissionRate: doctors.commissionRate })
    .from(doctors)
    .where(eq(doctors.id, params.doctorId));

  if (!doctor?.commissionRate) return;

  const rate = parseFloat(doctor.commissionRate);
  if (rate <= 0) return;

  const commissionAmount = (params.invoiceTotal * rate) / 100;

  await db.insert(doctorCommissions).values({
    tenantId: params.tenantId,
    doctorId: params.doctorId,
    invoiceId: params.invoiceId,
    amount: String(commissionAmount),
    rate: doctor.commissionRate,
    date: params.date,
  });
}

// Create credit note linked to an original invoice
export async function createCreditNote(params: {
  tenantId: string;
  originalInvoiceId: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; total: number; serviceId?: string; taxCategory?: string; taxRate?: number; taxAmount?: number }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  clientName: string;
  clientPhone?: string;
  clientId?: string;
  date: string;
  userId: string;
}) {
  const { invoiceItems: invoiceItemsTable } = await import("@/db/schema");

  // Get credit note number
  const [settings] = await db
    .select({ nextCreditNoteNumber: tenantSettings.nextCreditNoteNumber, invoicePrefix: tenantSettings.invoicePrefix })
    .from(tenantSettings)
    .where(eq(tenantSettings.tenantId, params.tenantId));

  const nextNum = settings?.nextCreditNoteNumber ?? 1;
  const invoiceNumber = `CN-${String(nextNum).padStart(5, "0")}`;

  // Increment counter
  await db
    .update(tenantSettings)
    .set({ nextCreditNoteNumber: nextNum + 1, updatedAt: new Date() })
    .where(eq(tenantSettings.tenantId, params.tenantId));

  // Create credit note invoice
  const [creditNote] = await db
    .insert(invoices)
    .values({
      tenantId: params.tenantId,
      invoiceNumber,
      date: params.date,
      clientId: params.clientId,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      subtotal: String(params.subtotal),
      taxRate: String(params.taxRate),
      taxAmount: String(params.taxAmount),
      total: String(params.total),
      status: "paid",
      invoiceType: "credit_note",
      invoiceTypeCode: "381",
      originalInvoiceId: params.originalInvoiceId,
    })
    .returning();

  // Insert items
  if (params.items.length > 0) {
    await db.insert(invoiceItemsTable).values(
      params.items.map((item) => ({
        invoiceId: creditNote.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        discount: String(item.discount),
        total: String(item.total),
        serviceId: item.serviceId,
        taxCategory: item.taxCategory || "S",
        taxRate: item.taxRate != null ? String(item.taxRate) : "15",
        taxAmount: item.taxAmount != null ? String(item.taxAmount) : "0",
      }))
    );
  }

  // Create reversal transaction
  await createReversalTransaction({
    tenantId: params.tenantId,
    invoiceId: creditNote.id,
    invoiceNumber,
    total: params.total,
    date: params.date,
    clientName: params.clientName,
  });

  return creditNote;
}

// Record a payment against an invoice
export async function recordPayment(params: {
  tenantId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  receiptNumber?: string;
  createdBy: string;
}) {
  // Insert payment record
  const [payment] = await db
    .insert(payments)
    .values({
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      amount: String(params.amount),
      paymentMethod: params.paymentMethod,
      paymentDate: params.paymentDate,
      referenceNumber: params.referenceNumber,
      notes: params.notes,
      receiptNumber: params.receiptNumber,
      createdBy: params.createdBy,
    })
    .returning();

  // Calculate total payments for this invoice
  const [totalPaid] = await db
    .select({ total: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.invoiceId, params.invoiceId));

  // Get invoice total
  const [invoice] = await db
    .select({ total: invoices.total, status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, params.invoiceId));

  if (!invoice) return payment;

  const invoiceTotal = parseFloat(invoice.total);
  const paidAmount = parseFloat(totalPaid.total || "0");

  // Update invoice status based on payment coverage
  let newStatus: "paid" | "partially_paid" | "unpaid";
  if (paidAmount >= invoiceTotal) {
    newStatus = "paid";
  } else if (paidAmount > 0) {
    newStatus = "partially_paid";
  } else {
    newStatus = "unpaid";
  }

  if (invoice.status !== newStatus) {
    await db
      .update(invoices)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(invoices.id, params.invoiceId));
  }

  return payment;
}
