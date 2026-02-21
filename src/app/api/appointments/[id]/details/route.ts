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
  appointments,
  invoices,
  appointmentAttachments,
  appointmentRecurrences,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // 1. Fetch appointment
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)));

    if (!appointment) return notFound("Appointment not found");

    // 2. Check if an invoice exists for this appointment
    const [invoiceCheck] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.appointmentId, id), eq(invoices.tenantId, tenantId)))
      .limit(1);
    const hasInvoice = !!invoiceCheck;

    // 3. Compute KPIs

    // Client visit count
    const clientAppointments = appointment.clientId
      ? await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.tenantId, tenantId),
              eq(appointments.clientId, appointment.clientId),
              eq(appointments.status, "completed")
            )
          )
      : [];
    const clientVisitCount = clientAppointments.length;

    // Client total spend
    let clientTotalSpend = 0;
    if (appointment.clientId) {
      const clientInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(eq(invoices.tenantId, tenantId), eq(invoices.status, "paid"))
        );
      // Match by clientName since invoices don't have clientId
      clientTotalSpend = clientInvoices
        .filter((inv) => inv.clientName === appointment.clientName)
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    }

    // Service popularity
    const serviceAppointments = appointment.serviceId
      ? await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.tenantId, tenantId),
              eq(appointments.serviceId, appointment.serviceId)
            )
          )
      : [];
    const servicePopularity = serviceAppointments.length;

    // Employee completion rate
    let employeeCompletionRate = 0;
    if (appointment.employeeId) {
      const empAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            eq(appointments.employeeId, appointment.employeeId)
          )
        );
      const completed = empAppointments.filter(
        (a) => a.status === "completed"
      ).length;
      employeeCompletionRate =
        empAppointments.length > 0
          ? Math.round((completed / empAppointments.length) * 100)
          : 0;
    }

    const kpis = {
      clientVisitCount,
      clientTotalSpend,
      servicePopularity,
      employeeCompletionRate,
    };

    // 3. Group appointments
    let groupAppointments: typeof serviceAppointments = [];
    if (appointment.groupId) {
      groupAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            eq(appointments.groupId, appointment.groupId)
          )
        )
        .orderBy(desc(appointments.date), desc(appointments.time));
    }

    // 4. Attachments
    const attachments = await db
      .select()
      .from(appointmentAttachments)
      .where(
        and(
          eq(appointmentAttachments.tenantId, tenantId),
          eq(appointmentAttachments.appointmentId, id)
        )
      )
      .orderBy(desc(appointmentAttachments.createdAt));

    // 5. Recurrence rule (if group exists)
    let recurrence = null;
    if (appointment.groupId) {
      const [rec] = await db
        .select()
        .from(appointmentRecurrences)
        .where(
          and(
            eq(appointmentRecurrences.tenantId, tenantId),
            eq(appointmentRecurrences.groupId, appointment.groupId)
          )
        );
      if (rec) {
        recurrence = {
          id: rec.id,
          groupId: rec.groupId,
          frequency: rec.frequency,
          interval: rec.interval,
          endDate: rec.endDate,
          occurrences: rec.occurrences,
        };
      }
    }

    return success({
      appointment: {
        ...appointment,
        price: parseFloat(appointment.price),
        hasInvoice,
      },
      kpis,
      groupAppointments: groupAppointments
        .filter((a) => a.id !== id)
        .map((a) => ({
          id: a.id,
          clientId: a.clientId,
          clientName: a.clientName,
          clientPhone: a.clientPhone || "",
          serviceId: a.serviceId,
          service: a.service,
          employeeId: a.employeeId,
          employee: a.employee,
          doctorId: a.doctorId,
          doctor: a.doctor,
          date: a.date,
          time: a.time,
          duration: a.duration,
          status: a.status,
          notes: a.notes,
          price: parseFloat(a.price),
          groupId: a.groupId,
        })),
      attachments: attachments.map((att) => ({
        id: att.id,
        appointmentId: att.appointmentId,
        url: att.url,
        filename: att.filename,
        mimeType: att.mimeType,
        label: att.label,
        caption: att.caption,
        createdAt: att.createdAt.toISOString(),
      })),
      recurrence,
    });
  } catch (error) {
    console.error("GET /api/appointments/[id]/details error:", error);
    return serverError();
  }
}
