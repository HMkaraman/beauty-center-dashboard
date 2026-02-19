import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  badRequest,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import {
  appointments,
  workingHours,
  employees,
  employeeSchedules,
  doctors,
  doctorSchedules,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Get day of week: 0=Saturday...6=Friday (matching the app's convention)
function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const jsDay = d.getDay();
  return jsDay === 6 ? 0 : jsDay + 1;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");
    const doctorId = searchParams.get("doctorId");

    if (!date) return badRequest("date is required");
    if (!employeeId && !doctorId) return badRequest("employeeId or doctorId is required");

    const dayOfWeek = getDayOfWeek(date);

    // Get center working hours for this day
    const [wh] = await db
      .select()
      .from(workingHours)
      .where(
        and(
          eq(workingHours.tenantId, tenantId),
          eq(workingHours.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);

    if (!wh || !wh.isOpen) {
      return success({
        workingHours: null,
        appointments: [],
        notWorking: true,
      });
    }

    let providerStart = wh.startTime;
    let providerEnd = wh.endTime;

    // Get provider-specific schedule
    if (employeeId) {
      const [empSchedule] = await db
        .select()
        .from(employeeSchedules)
        .where(
          and(
            eq(employeeSchedules.tenantId, tenantId),
            eq(employeeSchedules.employeeId, employeeId),
            eq(employeeSchedules.dayOfWeek, dayOfWeek)
          )
        )
        .limit(1);

      if (empSchedule && !empSchedule.isAvailable) {
        return success({
          workingHours: { start: wh.startTime, end: wh.endTime },
          appointments: [],
          notWorking: true,
        });
      }

      if (empSchedule) {
        providerStart = empSchedule.startTime;
        providerEnd = empSchedule.endTime;
      }
    }

    if (doctorId) {
      const [docSchedule] = await db
        .select()
        .from(doctorSchedules)
        .where(
          and(
            eq(doctorSchedules.tenantId, tenantId),
            eq(doctorSchedules.doctorId, doctorId),
            eq(doctorSchedules.dayOfWeek, dayOfWeek)
          )
        )
        .limit(1);

      if (docSchedule && !docSchedule.isAvailable) {
        return success({
          workingHours: { start: wh.startTime, end: wh.endTime },
          appointments: [],
          notWorking: true,
        });
      }

      if (docSchedule) {
        providerStart = docSchedule.startTime;
        providerEnd = docSchedule.endTime;
      }
    }

    // Get appointments for this provider on this date
    const providerConditions = [
      eq(appointments.tenantId, tenantId),
      eq(appointments.date, date),
      sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
    ];

    if (employeeId) {
      providerConditions.push(eq(appointments.employeeId, employeeId));
    } else if (doctorId) {
      providerConditions.push(eq(appointments.doctorId, doctorId));
    }

    const providerAppts = await db
      .select({
        id: appointments.id,
        time: appointments.time,
        duration: appointments.duration,
        clientName: appointments.clientName,
        service: appointments.service,
        status: appointments.status,
      })
      .from(appointments)
      .where(and(...providerConditions))
      .orderBy(appointments.time);

    return success({
      workingHours: { start: providerStart, end: providerEnd },
      appointments: providerAppts,
      notWorking: false,
    });
  } catch (error) {
    console.error("GET /api/reception/provider-schedule error:", error);
    return serverError();
  }
}
