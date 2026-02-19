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

    return success({
      ...conflict,
      nextAvailableSlot: nextSlot,
    });
  } catch (error) {
    console.error("POST /api/appointments/check-conflict error:", error);
    return serverError();
  }
}
