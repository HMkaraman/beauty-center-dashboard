import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { employees, appointments, invoices, employeeCommissions, employeeSchedules } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { EmployeePerformanceTier } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // 1. Fetch employee record
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));

    if (!employee) return notFound("Employee not found");

    // 2. Fetch ALL employee appointments
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          eq(appointments.employeeId, id)
        )
      )
      .orderBy(desc(appointments.date), desc(appointments.time));

    // 3. Fetch employee commissions
    const allCommissions = await db
      .select()
      .from(employeeCommissions)
      .where(
        and(
          eq(employeeCommissions.tenantId, tenantId),
          eq(employeeCommissions.employeeId, id)
        )
      )
      .orderBy(desc(employeeCommissions.date));

    // 4. Fetch employee schedules for utilization
    const schedules = await db
      .select()
      .from(employeeSchedules)
      .where(
        and(
          eq(employeeSchedules.tenantId, tenantId),
          eq(employeeSchedules.employeeId, id)
        )
      );

    // 5. Compute KPIs
    const completedAppointments = allAppointments.filter(
      (a) => a.status === "completed"
    );
    const cancelledAppointments = allAppointments.filter(
      (a) => a.status === "cancelled"
    );

    // Revenue: sum paid invoices linked to this employee's appointments
    const appointmentIds = allAppointments.map((a) => a.id);
    let revenueGenerated = 0;
    if (appointmentIds.length > 0) {
      const paidInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            eq(invoices.status, "paid")
          )
        );
      revenueGenerated = paidInvoices
        .filter((inv) => inv.appointmentId && appointmentIds.includes(inv.appointmentId))
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    }

    const completedCount = completedAppointments.length;
    const avgRevenuePerVisit =
      completedCount > 0 ? Math.round(revenueGenerated / completedCount) : 0;

    // Commission earned
    const commissionEarned = allCommissions.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );

    // Unique clients
    const uniqueClientIds = new Set(
      allAppointments
        .filter((a) => a.clientId)
        .map((a) => a.clientId)
    );
    const uniqueClients = uniqueClientIds.size;

    // Client retention rate: clients with 2+ visits / unique clients
    const clientVisitCounts: Record<string, number> = {};
    for (const a of completedAppointments) {
      if (a.clientId) {
        clientVisitCounts[a.clientId] = (clientVisitCounts[a.clientId] || 0) + 1;
      }
    }
    const repeatClients = Object.values(clientVisitCounts).filter((c) => c >= 2).length;
    const clientRetentionRate =
      uniqueClients > 0 ? Math.round((repeatClients / uniqueClients) * 100) : 0;

    // Cancellation rate
    const totalAppts = allAppointments.length;
    const cancellationRate =
      totalAppts > 0
        ? Math.round((cancelledAppointments.length / totalAppts) * 100)
        : 0;

    // Utilization rate: booked hours / available hours per week
    const availableSchedules = schedules.filter((s) => s.isAvailable === 1);
    let weeklyAvailableMinutes = 0;
    for (const s of availableSchedules) {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      weeklyAvailableMinutes += (eh * 60 + em) - (sh * 60 + sm);
    }

    // Approximate weekly booked minutes from last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksAgoStr = fourWeeksAgo.toISOString().split("T")[0];
    const recentBookedMinutes = allAppointments
      .filter((a) => a.date >= fourWeeksAgoStr && (a.status === "completed" || a.status === "confirmed" || a.status === "pending"))
      .reduce((sum, a) => sum + a.duration, 0);
    const weeklyBookedMinutes = recentBookedMinutes / 4;

    const utilizationRate =
      weeklyAvailableMinutes > 0
        ? Math.round((weeklyBookedMinutes / weeklyAvailableMinutes) * 100)
        : 0;

    const kpis = {
      totalAppointments: totalAppts,
      completedAppointments: completedCount,
      revenueGenerated,
      avgRevenuePerVisit,
      commissionEarned,
      uniqueClients,
      clientRetentionRate,
      cancellationRate,
      utilizationRate: Math.min(utilizationRate, 100),
    };

    // 6. Compute Analytics

    // Top services (top 3 by frequency among completed)
    const serviceFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      serviceFreq[a.service] = (serviceFreq[a.service] || 0) + 1;
    }
    const topServices = Object.entries(serviceFreq)
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Top clients (top 3 by frequency among completed)
    const clientFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      clientFreq[a.clientName] = (clientFreq[a.clientName] || 0) + 1;
    }
    const topClients = Object.entries(clientFreq)
      .map(([clientName, count]) => ({ clientName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    // We'll approximate revenue from appointment prices for completed appts
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthRevenue = completedAppointments
        .filter((a) => a.date.startsWith(yearMonth))
        .reduce((sum, a) => sum + parseFloat(a.price), 0);
      monthlyRevenue.push({ month: yearMonth, revenue: monthRevenue });
    }

    // Performance tier
    const hireDays = Math.floor(
      (Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    let performanceTier: EmployeePerformanceTier = "growing";
    if (hireDays < 30 && completedCount < 5) {
      performanceTier = "new";
    } else if (revenueGenerated >= 10000 || completedCount >= 50) {
      performanceTier = "star";
    } else if (revenueGenerated >= 3000 || completedCount >= 20) {
      performanceTier = "solid";
    }

    const analytics = {
      topServices,
      topClients,
      performanceTier,
      monthlyRevenue,
    };

    // 7. Build recent appointments (last 10)
    const recentAppointments = allAppointments.slice(0, 10).map((a) => ({
      id: a.id,
      clientName: a.clientName,
      clientPhone: a.clientPhone || "",
      service: a.service,
      employee: a.employee,
      date: a.date,
      time: a.time,
      duration: a.duration,
      status: a.status,
      notes: a.notes,
      price: parseFloat(a.price),
    }));

    // 8. Build recent commissions (last 10) with client name from invoice
    const recentCommissionRows = allCommissions.slice(0, 10);
    const commissionInvoiceIds = recentCommissionRows.map((c) => c.invoiceId);
    let invoiceMap: Record<string, string> = {};
    if (commissionInvoiceIds.length > 0) {
      const commissionInvoices = await db
        .select({ id: invoices.id, clientName: invoices.clientName })
        .from(invoices)
        .where(eq(invoices.tenantId, tenantId));
      for (const inv of commissionInvoices) {
        if (commissionInvoiceIds.includes(inv.id)) {
          invoiceMap[inv.id] = inv.clientName;
        }
      }
    }

    const recentCommissions = recentCommissionRows.map((c) => ({
      id: c.id,
      invoiceId: c.invoiceId,
      amount: parseFloat(c.amount),
      rate: parseFloat(c.rate),
      date: c.date,
      clientName: invoiceMap[c.invoiceId] || "",
    }));

    return success({
      employee: {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        email: employee.email || "",
        role: employee.role,
        specialties: employee.specialties || "",
        status: employee.status,
        appointments: totalAppts,
        revenue: revenueGenerated,
        rating: 0,
        hireDate: new Date(employee.hireDate).toISOString().split("T")[0],
        commissionRate: parseFloat(employee.commissionRate || "0"),
        salary: employee.salary ? parseFloat(employee.salary) : 0,
        nationalId: employee.nationalId || "",
        passportNumber: employee.passportNumber || "",
        dateOfBirth: employee.dateOfBirth || "",
        address: employee.address || "",
        emergencyContact: employee.emergencyContact || "",
        notes: employee.notes || "",
        image: employee.image,
      },
      kpis,
      analytics,
      recentAppointments,
      recentCommissions,
    });
  } catch (error) {
    console.error("GET /api/employees/[id]/details error:", error);
    return serverError();
  }
}
