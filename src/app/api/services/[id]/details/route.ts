import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import {
  services,
  appointments,
  invoices,
  serviceEmployees,
  employees,
  serviceInventoryRequirements,
  inventoryItems,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // 1. Fetch service record
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.tenantId, tenantId)));

    if (!service) return notFound("Service not found");

    // 2. Fetch ALL appointments for this service
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          eq(appointments.serviceId, id)
        )
      )
      .orderBy(desc(appointments.date), desc(appointments.time));

    // 3. Compute KPIs
    const completedAppointments = allAppointments.filter(
      (a) => a.status === "completed"
    );
    const cancelledAppointments = allAppointments.filter(
      (a) => a.status === "cancelled"
    );

    // Revenue from paid invoices linked to this service's appointments
    const appointmentIds = allAppointments.map((a) => a.id);
    let totalRevenue = 0;
    if (appointmentIds.length > 0) {
      const paidInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(eq(invoices.tenantId, tenantId), eq(invoices.status, "paid"))
        );
      totalRevenue = paidInvoices
        .filter(
          (inv) => inv.appointmentId && appointmentIds.includes(inv.appointmentId)
        )
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    }

    const totalBookings = allAppointments.length;
    const avgRevenuePerBooking =
      completedAppointments.length > 0
        ? Math.round(totalRevenue / completedAppointments.length)
        : 0;

    // Unique clients
    const uniqueClientIds = new Set(
      allAppointments.filter((a) => a.clientId).map((a) => a.clientId)
    );

    // Cancellation rate
    const cancellationRate =
      totalBookings > 0
        ? Math.round((cancelledAppointments.length / totalBookings) * 100)
        : 0;

    // Last booked
    const lastBooked =
      allAppointments.length > 0 ? allAppointments[0].date : null;

    const kpis = {
      totalBookings,
      totalRevenue,
      avgRevenuePerBooking,
      uniqueClients: uniqueClientIds.size,
      cancellationRate,
      lastBooked,
    };

    // 4. Analytics

    // Top employees (top 3 by frequency among completed)
    const employeeFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      if (a.employee) {
        employeeFreq[a.employee] = (employeeFreq[a.employee] || 0) + 1;
      }
    }
    const topEmployees = Object.entries(employeeFreq)
      .map(([employeeName, count]) => ({ employeeName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Top clients (top 3 by frequency among completed)
    const clientFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      if (a.clientName) {
        clientFreq[a.clientName] = (clientFreq[a.clientName] || 0) + 1;
      }
    }
    const topClients = Object.entries(clientFreq)
      .map(([clientName, count]) => ({ clientName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthRev = completedAppointments
        .filter((a) => a.date.startsWith(yearMonth))
        .reduce((sum, a) => sum + parseFloat(a.price), 0);
      monthlyRevenue.push({ month: yearMonth, revenue: monthRev });
    }

    const analytics = { topEmployees, topClients, monthlyRevenue };

    // 5. Recent appointments (last 10)
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

    // 6. Inventory requirements
    const requirements = await db
      .select({
        id: serviceInventoryRequirements.id,
        inventoryItemId: serviceInventoryRequirements.inventoryItemId,
        inventoryItemName: inventoryItems.name,
        quantityRequired: serviceInventoryRequirements.quantityRequired,
      })
      .from(serviceInventoryRequirements)
      .leftJoin(
        inventoryItems,
        eq(serviceInventoryRequirements.inventoryItemId, inventoryItems.id)
      )
      .where(eq(serviceInventoryRequirements.serviceId, id));

    const inventoryRequirementsResult = requirements.map((r) => ({
      id: r.id,
      inventoryItemId: r.inventoryItemId,
      inventoryItemName: r.inventoryItemName || "",
      quantityRequired: r.quantityRequired,
    }));

    // 7. Assigned employees
    const assignedRows = await db
      .select({
        id: employees.id,
        name: employees.name,
        role: employees.role,
      })
      .from(serviceEmployees)
      .innerJoin(employees, eq(serviceEmployees.employeeId, employees.id))
      .where(
        and(
          eq(serviceEmployees.serviceId, id),
          eq(serviceEmployees.tenantId, tenantId)
        )
      );

    return success({
      service: {
        id: service.id,
        name: service.name,
        nameEn: service.nameEn,
        categoryId: service.categoryId,
        category: service.category,
        duration: service.duration,
        price: parseFloat(service.price),
        status: service.status,
        bookings: totalBookings,
        image: service.image,
        description: service.description,
        serviceType: service.serviceType,
        laserMinShots: service.laserMinShots,
        laserMaxShots: service.laserMaxShots,
        injectableUnit: service.injectableUnit,
        injectableExpiryDays: service.injectableExpiryDays,
      },
      kpis,
      analytics,
      recentAppointments,
      inventoryRequirements: inventoryRequirementsResult,
      assignedEmployees: assignedRows,
    });
  } catch (error) {
    console.error("GET /api/services/[id]/details error:", error);
    return serverError();
  }
}
