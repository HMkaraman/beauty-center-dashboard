import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import {
  checkConflict,
  findNextAvailableSlot,
  checkEmployeeWorkingHours,
  checkDoctorWorkingHours,
} from "@/lib/business-logic/scheduling";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { employeeId, employee, doctorId, date, time, duration, excludeId } = body;

    if (!date || !time || !duration) {
      return badRequest("date, time, and duration are required");
    }

    const conflict = await checkConflict({
      tenantId: session.user.tenantId,
      employeeId,
      employee,
      doctorId,
      date,
      time,
      duration: duration || 60,
      excludeId,
    });

    let nextSlot: string | null = null;
    if (conflict.hasConflict) {
      nextSlot = await findNextAvailableSlot({
        tenantId: session.user.tenantId,
        employeeId,
        employee,
        doctorId,
        date,
        duration: duration || 60,
      });
    }

    // Check working hours for employee and doctor
    let employeeHoursWarning: { start: string; end: string } | null = null;
    let doctorHoursWarning: { start: string; end: string } | null = null;

    if (employeeId) {
      const empCheck = await checkEmployeeWorkingHours({
        tenantId: session.user.tenantId,
        employeeId,
        date,
        time,
        duration: duration || 60,
      });
      if (!empCheck.withinSchedule && empCheck.schedule) {
        employeeHoursWarning = { start: empCheck.schedule.startTime, end: empCheck.schedule.endTime };
      }
    }

    if (doctorId) {
      const docCheck = await checkDoctorWorkingHours({
        tenantId: session.user.tenantId,
        doctorId,
        date,
        time,
        duration: duration || 60,
      });
      if (!docCheck.withinSchedule && docCheck.schedule) {
        doctorHoursWarning = { start: docCheck.schedule.startTime, end: docCheck.schedule.endTime };
      }
    }

    return success({
      ...conflict,
      nextAvailableSlot: nextSlot,
      employeeHoursWarning,
      doctorHoursWarning,
    });
  } catch (error) {
    console.error("POST /api/appointments/check-conflict error:", error);
    return serverError();
  }
}
