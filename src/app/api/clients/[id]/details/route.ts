import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { clients, appointments, invoices, invoiceItems } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import type { ClientValueTier } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // 1. Fetch client record
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)));

    if (!client) return notFound("Client not found");

    // 2. Fetch ALL client appointments
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          eq(appointments.clientId, id)
        )
      )
      .orderBy(desc(appointments.date), desc(appointments.time));

    // 3. Fetch ALL client invoices
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.clientId, id)
        )
      )
      .orderBy(desc(invoices.createdAt));

    // Fetch invoice items for recent 10 invoices
    const recentInvoiceRows = allInvoices.slice(0, 10);
    const invoiceIds = recentInvoiceRows.map((inv) => inv.id);
    const items =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(invoiceItems)
            .where(inArray(invoiceItems.invoiceId, invoiceIds))
        : [];

    // 4. Compute KPIs
    const completedAppointments = allAppointments.filter(
      (a) => a.status === "completed"
    );
    const cancelledAppointments = allAppointments.filter(
      (a) => a.status === "cancelled"
    );
    const noShowAppointments = allAppointments.filter(
      (a) => a.status === "no-show"
    );

    const paidInvoices = allInvoices.filter((inv) => inv.status === "paid");
    const totalSpent = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.total),
      0
    );

    const completedCount = completedAppointments.length;
    const averageSpendPerVisit =
      completedCount > 0 ? totalSpent / completedCount : 0;

    // Last visit date from completed appointments
    const lastVisitDate =
      completedAppointments.length > 0
        ? completedAppointments[0].date
        : null;

    // Cancellation rate
    const totalAppts = allAppointments.length;
    const cancellationRate =
      totalAppts > 0
        ? Math.round(
            (cancelledAppointments.length / totalAppts) * 100
          )
        : 0;

    // Client lifetime days
    const joinDate = client.joinDate
      ? new Date(client.joinDate)
      : client.createdAt;
    const clientLifetimeDays = Math.floor(
      (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Visit frequency: average days between completed visits
    let visitFrequencyDays = 0;
    if (completedAppointments.length >= 2) {
      const dates = completedAppointments
        .map((a) => new Date(a.date).getTime())
        .sort((a, b) => a - b);
      let totalGap = 0;
      for (let i = 1; i < dates.length; i++) {
        totalGap += dates[i] - dates[i - 1];
      }
      visitFrequencyDays = Math.round(
        totalGap / (dates.length - 1) / (1000 * 60 * 60 * 24)
      );
    }

    const kpis = {
      totalAppointments: totalAppts,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledAppointments.length,
      noShowAppointments: noShowAppointments.length,
      totalSpent,
      averageSpendPerVisit: Math.round(averageSpendPerVisit),
      lastVisitDate,
      cancellationRate,
      clientLifetimeDays,
      visitFrequencyDays,
    };

    // 5. Compute Analytics

    // Favorite services (top 3 by frequency among completed)
    const serviceFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      serviceFreq[a.service] = (serviceFreq[a.service] || 0) + 1;
    }
    const favoriteServices = Object.entries(serviceFreq)
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Preferred employees (top 3 by frequency among completed)
    const employeeFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      employeeFreq[a.employee] = (employeeFreq[a.employee] || 0) + 1;
    }
    const preferredEmployees = Object.entries(employeeFreq)
      .map(([employeeName, count]) => ({ employeeName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Monthly visits (last 6 months)
    const now = new Date();
    const monthlyVisits: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = completedAppointments.filter((a) => {
        return a.date.startsWith(yearMonth);
      }).length;
      monthlyVisits.push({ month: yearMonth, count });
    }

    // Value tier
    let valueTier: ClientValueTier = "regular";
    if (clientLifetimeDays < 30 && completedCount < 2) {
      valueTier = "new";
    } else if (
      lastVisitDate &&
      (Date.now() - new Date(lastVisitDate).getTime()) /
        (1000 * 60 * 60 * 24) >=
        60
    ) {
      valueTier = "at-risk";
    } else if (totalSpent >= 5000 || completedCount >= 10) {
      valueTier = "vip";
    }

    const analytics = {
      favoriteServices,
      preferredEmployees,
      valueTier,
      monthlyVisits,
    };

    // 6. Build recent appointments (last 10) with parsed price
    const recentAppointments = allAppointments.slice(0, 10).map((a) => ({
      ...a,
      price: parseFloat(a.price),
    }));

    // 7. Build recent invoices (last 10) with items
    const recentInvoices = recentInvoiceRows.map((inv) => ({
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
      client: {
        ...client,
        totalAppointments: totalAppts,
        totalSpent,
        lastVisit: lastVisitDate || "",
        joinDate: client.joinDate
          ? new Date(client.joinDate).toISOString().split("T")[0]
          : "",
      },
      kpis,
      analytics,
      recentAppointments,
      recentInvoices,
    });
  } catch (error) {
    console.error("GET /api/clients/[id]/details error:", error);
    return serverError();
  }
}
