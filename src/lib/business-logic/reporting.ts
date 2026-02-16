import { db } from "@/db/db";
import { appointments, clients, employees, invoices, expenses, inventoryItems, transactions } from "@/db/schema";
import { eq, and, sql, between, count, gte, lte } from "drizzle-orm";

interface ReportData {
  summary: Record<string, number | string>;
  details: Record<string, unknown>[];
}

export async function generateFinancialReport(tenantId: string, startDate: string, endDate: string): Promise<ReportData> {
  const [revenueResult] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
      paidCount: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)`,
      unpaidCount: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'unpaid' THEN 1 END)`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.tenantId, tenantId),
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));

  const [expenseResult] = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      approvedCount: sql<number>`COUNT(CASE WHEN ${expenses.status} = 'approved' THEN 1 END)`,
    })
    .from(expenses)
    .where(and(
      eq(expenses.tenantId, tenantId),
      gte(expenses.date, startDate),
      lte(expenses.date, endDate)
    ));

  const revenue = parseFloat(revenueResult.totalRevenue);
  const expensesTotal = parseFloat(expenseResult.totalExpenses);

  return {
    summary: {
      totalRevenue: revenue,
      totalExpenses: expensesTotal,
      netProfit: revenue - expensesTotal,
      profitMargin: revenue > 0 ? ((revenue - expensesTotal) / revenue * 100) : 0,
      paidInvoices: revenueResult.paidCount,
      unpaidInvoices: revenueResult.unpaidCount,
      approvedExpenses: expenseResult.approvedCount,
    },
    details: [],
  };
}

export async function generateAppointmentsReport(tenantId: string, startDate: string, endDate: string): Promise<ReportData> {
  const [stats] = await db
    .select({
      total: count(),
      completed: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'completed' THEN 1 END)`,
      cancelled: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 END)`,
      noShow: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'no-show' THEN 1 END)`,
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${appointments.status} = 'completed' THEN ${appointments.price} ELSE 0 END), 0)`,
    })
    .from(appointments)
    .where(and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.date, startDate),
      lte(appointments.date, endDate)
    ));

  return {
    summary: {
      totalAppointments: stats.total,
      completed: stats.completed,
      cancelled: stats.cancelled,
      noShow: stats.noShow,
      completionRate: stats.total > 0 ? (stats.completed / stats.total * 100) : 0,
      totalRevenue: parseFloat(stats.totalRevenue),
    },
    details: [],
  };
}

export async function generateClientsReport(tenantId: string, startDate: string, endDate: string): Promise<ReportData> {
  const [stats] = await db
    .select({
      totalClients: count(),
      activeClients: sql<number>`COUNT(CASE WHEN ${clients.status} = 'active' THEN 1 END)`,
    })
    .from(clients)
    .where(eq(clients.tenantId, tenantId));

  // New clients in period
  const [newClients] = await db
    .select({ count: count() })
    .from(clients)
    .where(and(
      eq(clients.tenantId, tenantId),
      gte(sql`${clients.joinDate}::date`, sql`${startDate}::date`),
      lte(sql`${clients.joinDate}::date`, sql`${endDate}::date`)
    ));

  return {
    summary: {
      totalClients: stats.totalClients,
      activeClients: stats.activeClients,
      newClientsInPeriod: newClients.count,
      retentionRate: stats.totalClients > 0 ? (stats.activeClients / stats.totalClients * 100) : 0,
    },
    details: [],
  };
}

export async function generateEmployeesReport(tenantId: string, startDate: string, endDate: string): Promise<ReportData> {
  const topEmployees = await db
    .select({
      employeeId: appointments.employeeId,
      employeeName: appointments.employee,
      appointmentCount: count(),
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${appointments.status} = 'completed' THEN ${appointments.price} ELSE 0 END), 0)`,
    })
    .from(appointments)
    .where(and(
      eq(appointments.tenantId, tenantId),
      gte(appointments.date, startDate),
      lte(appointments.date, endDate)
    ))
    .groupBy(appointments.employeeId, appointments.employee)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  return {
    summary: {
      totalEmployeesWithAppointments: topEmployees.length,
    },
    details: topEmployees.map(e => ({
      name: e.employeeName,
      appointments: e.appointmentCount,
      revenue: parseFloat(e.totalRevenue),
    })),
  };
}

export async function generateInventoryReport(tenantId: string): Promise<ReportData> {
  const items = await db
    .select({
      total: count(),
      inStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.status} = 'in-stock' THEN 1 END)`,
      lowStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.status} = 'low-stock' THEN 1 END)`,
      outOfStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.status} = 'out-of-stock' THEN 1 END)`,
      totalValue: sql<string>`COALESCE(SUM(${inventoryItems.quantity} * ${inventoryItems.unitPrice}), 0)`,
    })
    .from(inventoryItems)
    .where(eq(inventoryItems.tenantId, tenantId));

  return {
    summary: {
      totalItems: items[0].total,
      inStock: items[0].inStock,
      lowStock: items[0].lowStock,
      outOfStock: items[0].outOfStock,
      totalInventoryValue: parseFloat(items[0].totalValue),
    },
    details: [],
  };
}

// Main entry point
export async function generateReport(
  type: string,
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  switch (type) {
    case "financial":
      return generateFinancialReport(tenantId, startDate, endDate);
    case "appointments":
      return generateAppointmentsReport(tenantId, startDate, endDate);
    case "clients":
      return generateClientsReport(tenantId, startDate, endDate);
    case "employees":
      return generateEmployeesReport(tenantId, startDate, endDate);
    case "inventory":
      return generateInventoryReport(tenantId);
    default:
      return { summary: {}, details: [] };
  }
}
