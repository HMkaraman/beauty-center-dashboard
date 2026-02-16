import { db } from "@/db/db";
import { transactions, employees } from "@/db/schema";
import { employeeCommissions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Create income transaction when invoice is paid
export async function createIncomeTransaction(params: {
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
    description: `Invoice ${params.invoiceNumber} - ${params.clientName}`,
    category: "خدمات", // Services
    type: "income",
    amount: String(params.total),
    invoiceId: params.invoiceId,
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
}) {
  await db.insert(transactions).values({
    tenantId: params.tenantId,
    date: params.date,
    description: params.description,
    category: params.category,
    type: "expense",
    amount: String(params.amount),
    expenseId: params.expenseId,
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
