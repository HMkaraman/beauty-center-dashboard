import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAvailableSlots, getAvailableDates } from "@/lib/business-logic/availability";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const employeeId = searchParams.get("employeeId") || undefined;
  const doctorId = searchParams.get("doctorId") || undefined;
  const excludeId = searchParams.get("excludeId") || undefined;
  const mode = searchParams.get("mode"); // "dates" or "slots" (default)

  if (!serviceId) return badRequest("serviceId is required");

  try {
    const tenantId = session.user.tenantId;

    // Look up service to get duration
    const [service] = await db
      .select({ duration: services.duration })
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.tenantId, tenantId)))
      .limit(1);

    if (!service) return badRequest("Service not found");

    if (mode === "dates") {
      // Return available dates
      const dates = await getAvailableDates({
        tenantId,
        serviceDuration: service.duration,
        employeeId,
        doctorId,
        excludeAppointmentId: excludeId,
      });
      return success({ dates });
    }

    // Default: return available time slots for a specific date
    if (!date) return badRequest("date is required for slot lookup");

    const slots = await getAvailableSlots({
      tenantId,
      date,
      serviceDuration: service.duration,
      employeeId,
      doctorId,
      excludeAppointmentId: excludeId,
    });

    return success({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return serverError();
  }
}
