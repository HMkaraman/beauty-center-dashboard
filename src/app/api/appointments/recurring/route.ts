import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments, appointmentRecurrences } from "@/db/schema";
import {
  checkConflict,
  checkCenterWorkingHours,
  checkEmployeeWorkingHours,
  checkDoctorWorkingHours,
} from "@/lib/business-logic/scheduling";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const body = await req.json();

    const {
      appointment: appointmentData,
      recurrence,
    } = body as {
      appointment: {
        clientId?: string;
        clientName: string;
        clientPhone?: string;
        serviceId?: string;
        service: string;
        employeeId?: string;
        employee: string;
        doctorId?: string;
        doctor?: string;
        date: string;
        time: string;
        duration: number;
        price: number;
        notes?: string;
      };
      recurrence: {
        frequency: "daily" | "weekly" | "biweekly" | "monthly";
        interval?: number;
        endDate?: string;
        occurrences?: number;
      };
    };

    if (!appointmentData?.clientName || !appointmentData?.service || !appointmentData?.date || !appointmentData?.time) {
      return badRequest("Missing required appointment fields");
    }

    if (!recurrence?.frequency) {
      return badRequest("Missing recurrence frequency");
    }

    if (!recurrence.endDate && !recurrence.occurrences) {
      return badRequest("Either endDate or occurrences is required");
    }

    // Generate recurring dates
    const dates = generateRecurringDates(
      appointmentData.date,
      recurrence.frequency,
      recurrence.interval || 1,
      recurrence.endDate,
      recurrence.occurrences
    );

    if (dates.length === 0) {
      return badRequest("No dates generated for recurrence");
    }

    // Check conflicts for each date
    const validDates: string[] = [];
    const skipped: Array<{ date: string; reason: string }> = [];

    for (const date of dates) {
      // Check center working hours
      const centerHours = await checkCenterWorkingHours({
        tenantId,
        date,
        time: appointmentData.time,
        duration: appointmentData.duration,
      });

      if (!centerHours.withinSchedule) {
        skipped.push({
          date,
          reason: centerHours.centerClosed
            ? "Center is closed on this day"
            : `Outside center working hours (${centerHours.schedule?.startTime}–${centerHours.schedule?.endTime})`,
        });
        continue;
      }

      // Check employee/doctor conflict
      if (appointmentData.employeeId || appointmentData.doctorId) {
        const conflict = await checkConflict({
          tenantId,
          employeeId: appointmentData.employeeId || null,
          employee: appointmentData.employee,
          doctorId: appointmentData.doctorId || null,
          date,
          time: appointmentData.time,
          duration: appointmentData.duration,
        });

        if (conflict.hasConflict) {
          const who = conflict.conflictType === "doctor" ? "Doctor" : "Employee";
          skipped.push({
            date,
            reason: `${who} has a conflicting appointment at ${conflict.conflictingAppointment?.time}`,
          });
          continue;
        }
      }

      // Check employee working hours
      if (appointmentData.employeeId) {
        const empHours = await checkEmployeeWorkingHours({
          tenantId,
          employeeId: appointmentData.employeeId,
          date,
          time: appointmentData.time,
          duration: appointmentData.duration,
        });

        if (!empHours.withinSchedule) {
          skipped.push({
            date,
            reason: empHours.schedule
              ? `Outside employee working hours (${empHours.schedule.startTime}–${empHours.schedule.endTime})`
              : "Employee not available on this day",
          });
          continue;
        }
      }

      // Check doctor working hours
      if (appointmentData.doctorId) {
        const docHours = await checkDoctorWorkingHours({
          tenantId,
          doctorId: appointmentData.doctorId,
          date,
          time: appointmentData.time,
          duration: appointmentData.duration,
        });

        if (!docHours.withinSchedule) {
          skipped.push({
            date,
            reason: docHours.schedule
              ? `Outside doctor working hours (${docHours.schedule.startTime}–${docHours.schedule.endTime})`
              : "Doctor not available on this day",
          });
          continue;
        }
      }

      validDates.push(date);
    }

    // If all dates have conflicts, return error
    if (validDates.length === 0) {
      return badRequest(
        JSON.stringify({
          message: "All dates have conflicts",
          skipped,
          skippedCount: skipped.length,
          totalRequested: dates.length,
        })
      );
    }

    const groupId = crypto.randomUUID();

    // Create only valid appointments
    const createdAppointments = await db
      .insert(appointments)
      .values(
        validDates.map((date) => ({
          tenantId,
          clientId: appointmentData.clientId || null,
          clientName: appointmentData.clientName,
          clientPhone: appointmentData.clientPhone || null,
          serviceId: appointmentData.serviceId || null,
          service: appointmentData.service,
          employeeId: appointmentData.employeeId || null,
          employee: appointmentData.employee,
          doctorId: appointmentData.doctorId || null,
          doctor: appointmentData.doctor || null,
          date,
          time: appointmentData.time,
          duration: appointmentData.duration,
          price: String(appointmentData.price),
          status: "pending" as const,
          notes: appointmentData.notes || null,
          groupId,
        }))
      )
      .returning();

    // Save recurrence rule
    await db.insert(appointmentRecurrences).values({
      tenantId,
      groupId,
      frequency: recurrence.frequency,
      interval: recurrence.interval || 1,
      endDate: recurrence.endDate || null,
      occurrences: recurrence.occurrences || null,
    });

    return success(
      {
        groupId,
        created: createdAppointments.map((a) => ({
          ...a,
          price: parseFloat(a.price),
        })),
        createdCount: createdAppointments.length,
        skipped,
        skippedCount: skipped.length,
        totalRequested: dates.length,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/appointments/recurring error:", error);
    return serverError();
  }
}

function generateRecurringDates(
  startDate: string,
  frequency: "daily" | "weekly" | "biweekly" | "monthly",
  interval: number,
  endDate?: string,
  occurrences?: number
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T00:00:00");
  const maxOccurrences = occurrences || 365; // safety cap
  const end = endDate ? new Date(endDate + "T23:59:59") : null;

  let current = new Date(start);

  for (let i = 0; i < maxOccurrences; i++) {
    const dateStr = current.toISOString().split("T")[0];

    if (end && current > end) break;

    dates.push(dateStr);

    // Advance to next occurrence
    switch (frequency) {
      case "daily":
        current.setDate(current.getDate() + interval);
        break;
      case "weekly":
        current.setDate(current.getDate() + 7 * interval);
        break;
      case "biweekly":
        current.setDate(current.getDate() + 14 * interval);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + interval);
        break;
    }
  }

  return dates;
}
