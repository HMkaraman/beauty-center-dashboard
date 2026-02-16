import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { doctors, appointments, invoices } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { DoctorPerformanceTier } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // 1. Fetch doctor record
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, tenantId)));

    if (!doctor) return notFound("Doctor not found");

    // 2. Fetch ALL doctor appointments (via doctorId FK)
    const allAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          eq(appointments.doctorId, id)
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

    // Revenue: sum paid invoices linked to this doctor's appointments
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
    const avgRevenuePerConsultation =
      completedCount > 0 ? Math.round(revenueGenerated / completedCount) : 0;

    // Unique patients
    const uniquePatientIds = new Set(
      allAppointments
        .filter((a) => a.clientId)
        .map((a) => a.clientId)
    );
    const uniquePatients = uniquePatientIds.size;

    // Patient retention rate
    const patientVisitCounts: Record<string, number> = {};
    for (const a of completedAppointments) {
      if (a.clientId) {
        patientVisitCounts[a.clientId] = (patientVisitCounts[a.clientId] || 0) + 1;
      }
    }
    const repeatPatients = Object.values(patientVisitCounts).filter((c) => c >= 2).length;
    const patientRetentionRate =
      uniquePatients > 0 ? Math.round((repeatPatients / uniquePatients) * 100) : 0;

    // Cancellation rate
    const totalAppts = allAppointments.length;
    const cancellationRate =
      totalAppts > 0
        ? Math.round((cancelledAppointments.length / totalAppts) * 100)
        : 0;

    // Last consultation date
    const lastConsultationDate =
      completedAppointments.length > 0
        ? completedAppointments[0].date
        : null;

    const rating = parseFloat(doctor.rating || "0");

    const kpis = {
      totalConsultations: totalAppts,
      completedConsultations: completedCount,
      revenueGenerated,
      avgRevenuePerConsultation,
      uniquePatients,
      patientRetentionRate,
      cancellationRate,
      lastConsultationDate,
      rating,
    };

    // 4. Compute Analytics

    // Top procedures (top 3 by frequency among completed)
    const serviceFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      serviceFreq[a.service] = (serviceFreq[a.service] || 0) + 1;
    }
    const topProcedures = Object.entries(serviceFreq)
      .map(([serviceName, count]) => ({ serviceName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Top patients (top 3 by frequency among completed)
    const patientFreq: Record<string, number> = {};
    for (const a of completedAppointments) {
      patientFreq[a.clientName] = (patientFreq[a.clientName] || 0) + 1;
    }
    const topPatients = Object.entries(patientFreq)
      .map(([clientName, count]) => ({ clientName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Monthly consultations (last 6 months)
    const now = new Date();
    const monthlyConsultations: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = completedAppointments.filter((a) =>
        a.date.startsWith(yearMonth)
      ).length;
      monthlyConsultations.push({ month: yearMonth, count });
    }

    // Performance tier
    let performanceTier: DoctorPerformanceTier = "growing";
    const doctorCreatedDays = Math.floor(
      (Date.now() - new Date(doctor.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (doctorCreatedDays < 30 && completedCount < 5) {
      performanceTier = "new";
    } else if (revenueGenerated >= 10000 || completedCount >= 50) {
      performanceTier = "star";
    } else if (revenueGenerated >= 3000 || completedCount >= 20) {
      performanceTier = "solid";
    }

    const analytics = {
      topProcedures,
      topPatients,
      performanceTier,
      monthlyConsultations,
    };

    // 5. Build recent appointments (last 10)
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

    return success({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        phone: doctor.phone,
        email: doctor.email || "",
        status: doctor.status,
        rating,
        consultations: totalAppts,
        licenseNumber: doctor.licenseNumber || "",
        image: doctor.image,
      },
      kpis,
      analytics,
      recentAppointments,
    });
  } catch (error) {
    console.error("GET /api/doctors/[id]/details error:", error);
    return serverError();
  }
}
