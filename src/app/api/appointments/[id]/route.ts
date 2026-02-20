import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { appointmentSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { deductInventoryForService } from "@/lib/business-logic/inventory";
import { checkConflict, checkCenterWorkingHours, checkDoctorWorkingHours, checkEmployeeWorkingHours } from "@/lib/business-logic/scheduling";
import { logActivity, buildRelatedEntities } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, session.user.tenantId))
      );

    if (!appointment) return notFound("Appointment not found");

    return success({
      ...appointment,
      price: parseFloat(appointment.price),
    });
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = appointmentSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // Fetch the current appointment to check old status
    const [existing] = await db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, session.user.tenantId))
      );

    if (!existing) return notFound("Appointment not found");

    // Check for scheduling conflicts if any scheduling fields changed
    const schedulingChanged =
      validated.date !== undefined ||
      validated.time !== undefined ||
      validated.duration !== undefined ||
      validated.employeeId !== undefined ||
      validated.employee !== undefined ||
      validated.doctorId !== undefined;

    if (schedulingChanged) {
      // Check center working hours
      const centerHours = await checkCenterWorkingHours({
        tenantId: session.user.tenantId,
        date: validated.date ?? existing.date,
        time: validated.time ?? existing.time,
        duration: validated.duration ?? existing.duration,
      });

      if (!centerHours.withinSchedule) {
        if (centerHours.centerClosed) {
          return badRequest("The center is closed on this day");
        }
        return badRequest(
          `This time is outside the center's working hours (${centerHours.schedule?.startTime} - ${centerHours.schedule?.endTime})`
        );
      }

      const mergedDoctorId = validated.doctorId ?? existing.doctorId;

      const conflict = await checkConflict({
        tenantId: session.user.tenantId,
        employeeId: validated.employeeId ?? existing.employeeId,
        employee: validated.employee ?? existing.employee,
        doctorId: mergedDoctorId,
        date: validated.date ?? existing.date,
        time: validated.time ?? existing.time,
        duration: validated.duration ?? existing.duration,
        excludeId: id,
      });

      if (conflict.hasConflict) {
        if (conflict.conflictType === "doctor") {
          return badRequest(
            `Doctor has a conflicting appointment at ${conflict.conflictingAppointment?.time} (${conflict.conflictingAppointment?.service})`
          );
        }
        return badRequest(
          `Employee has a conflicting appointment at ${conflict.conflictingAppointment?.time} (${conflict.conflictingAppointment?.service})`
        );
      }

      // Check employee working hours
      const mergedEmployeeId = validated.employeeId ?? existing.employeeId;
      if (mergedEmployeeId) {
        const empHoursCheck = await checkEmployeeWorkingHours({
          tenantId: session.user.tenantId,
          employeeId: mergedEmployeeId,
          date: validated.date ?? existing.date,
          time: validated.time ?? existing.time,
          duration: validated.duration ?? existing.duration,
        });

        if (!empHoursCheck.withinSchedule && empHoursCheck.schedule) {
          return badRequest(
            `This time is outside the employee's working hours (${empHoursCheck.schedule.startTime} - ${empHoursCheck.schedule.endTime})`
          );
        }
      }

      // Check doctor working hours
      if (mergedDoctorId) {
        const hoursCheck = await checkDoctorWorkingHours({
          tenantId: session.user.tenantId,
          doctorId: mergedDoctorId,
          date: validated.date ?? existing.date,
          time: validated.time ?? existing.time,
          duration: validated.duration ?? existing.duration,
        });

        if (!hoursCheck.withinSchedule && hoursCheck.schedule) {
          return badRequest(
            `This time is outside the doctor's working hours (${hoursCheck.schedule.startTime} - ${hoursCheck.schedule.endTime})`
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.price !== undefined) {
      updateData.price = String(validated.price);
    }

    const [updated] = await db
      .update(appointments)
      .set(updateData)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, session.user.tenantId))
      )
      .returning();

    if (!updated) return notFound("Appointment not found");

    // Deduct inventory when appointment status changes to "completed"
    if (
      validated.status === "completed" &&
      existing.status !== "completed" &&
      updated.serviceId
    ) {
      try {
        await deductInventoryForService({
          tenantId: session.user.tenantId,
          serviceId: updated.serviceId,
          appointmentId: updated.id,
        });
      } catch (inventoryError) {
        console.error("Inventory deduction error:", inventoryError);
        // Don't fail the appointment update if inventory deduction fails
      }
    }

    // Build related entities: include current + old (if changed) so logs appear on both timelines
    const relatedEntities = buildRelatedEntities({
      clientId: updated.clientId,
      employeeId: updated.employeeId,
      doctorId: updated.doctorId,
    });
    if (existing.clientId && existing.clientId !== updated.clientId) {
      relatedEntities.push({ entityType: "client", entityId: existing.clientId });
    }
    if (existing.employeeId && existing.employeeId !== updated.employeeId) {
      relatedEntities.push({ entityType: "employee", entityId: existing.employeeId });
    }
    if (existing.doctorId && existing.doctorId !== updated.doctorId) {
      relatedEntities.push({ entityType: "doctor", entityId: existing.doctorId });
    }

    logActivity({
      session,
      entityType: "appointment",
      entityId: id,
      action: "update",
      entityLabel: `${updated.clientName} - ${updated.service}`,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
      relatedEntities,
    });

    return success({
      ...updated,
      price: parseFloat(updated.price),
    });
  } catch (error) {
    console.error("PATCH /api/appointments/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(appointments)
      .where(
        and(eq(appointments.id, id), eq(appointments.tenantId, session.user.tenantId))
      )
      .returning();

    if (!deleted) return notFound("Appointment not found");

    logActivity({
      session,
      entityType: "appointment",
      entityId: id,
      action: "delete",
      entityLabel: `${deleted.clientName} - ${deleted.service}`,
      relatedEntities: buildRelatedEntities({
        clientId: deleted.clientId,
        employeeId: deleted.employeeId,
        doctorId: deleted.doctorId,
      }),
    });

    return success({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return serverError();
  }
}
