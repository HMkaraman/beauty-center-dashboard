import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { appointmentSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count, gte, lte } from "drizzle-orm";
import { checkConflict, checkCenterWorkingHours, checkDoctorWorkingHours, checkEmployeeWorkingHours } from "@/lib/business-logic/scheduling";
import { logActivity, buildRelatedEntities, buildCreateChanges } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const date = url.searchParams.get("date");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    const conditions = [eq(appointments.tenantId, tenantId)];

    if (search) {
      conditions.push(
        sql`(${ilike(appointments.clientName, `%${search}%`)} OR ${ilike(appointments.service, `%${search}%`)} OR ${ilike(appointments.employee, `%${search}%`)})`
      );
    }

    if (status) {
      conditions.push(
        eq(
          appointments.status,
          status as "confirmed" | "pending" | "cancelled" | "completed" | "no-show" | "waiting" | "in-progress"
        )
      );
    }

    if (date) {
      conditions.push(eq(appointments.date, date));
    }

    if (dateFrom) {
      conditions.push(gte(appointments.date, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(appointments.date, dateTo));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(appointments)
        .where(whereClause)
        .orderBy(desc(appointments.date), desc(appointments.time))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(appointments)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data: data.map((row) => ({
        ...row,
        price: parseFloat(row.price),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = appointmentSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // Check center working hours first
    const centerHours = await checkCenterWorkingHours({
      tenantId: session.user.tenantId,
      date: validated.date,
      time: validated.time,
      duration: validated.duration,
    });

    if (!centerHours.withinSchedule) {
      if (centerHours.centerClosed) {
        return badRequest("The center is closed on this day");
      }
      return badRequest(
        `This time is outside the center's working hours (${centerHours.schedule?.startTime} - ${centerHours.schedule?.endTime})`
      );
    }

    // Check for scheduling conflicts before creating
    const conflict = await checkConflict({
      tenantId: session.user.tenantId,
      employeeId: validated.employeeId,
      employee: validated.employee,
      doctorId: validated.doctorId,
      date: validated.date,
      time: validated.time,
      duration: validated.duration,
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
    if (validated.employeeId) {
      const hoursCheck = await checkEmployeeWorkingHours({
        tenantId: session.user.tenantId,
        employeeId: validated.employeeId,
        date: validated.date,
        time: validated.time,
        duration: validated.duration,
      });

      if (!hoursCheck.withinSchedule && hoursCheck.schedule) {
        return badRequest(
          `This time is outside the employee's working hours (${hoursCheck.schedule.startTime} - ${hoursCheck.schedule.endTime})`
        );
      }
    }

    // Check doctor working hours
    if (validated.doctorId) {
      const hoursCheck = await checkDoctorWorkingHours({
        tenantId: session.user.tenantId,
        doctorId: validated.doctorId,
        date: validated.date,
        time: validated.time,
        duration: validated.duration,
      });

      if (!hoursCheck.withinSchedule && hoursCheck.schedule) {
        return badRequest(
          `This time is outside the doctor's working hours (${hoursCheck.schedule.startTime} - ${hoursCheck.schedule.endTime})`
        );
      }
    }

    const [created] = await db
      .insert(appointments)
      .values({
        tenantId: session.user.tenantId,
        clientId: validated.clientId,
        clientName: validated.clientName,
        clientPhone: validated.clientPhone,
        serviceId: validated.serviceId,
        service: validated.service,
        employeeId: validated.employeeId,
        employee: validated.employee || "",
        doctorId: validated.doctorId,
        doctor: validated.doctor,
        date: validated.date,
        time: validated.time,
        duration: validated.duration,
        status: validated.status,
        price: String(validated.price),
        notes: validated.notes,
        groupId: validated.groupId,
      })
      .returning();

    logActivity({
      session,
      entityType: "appointment",
      entityId: created.id,
      action: "create",
      entityLabel: `${created.clientName} - ${created.service}`,
      changes: buildCreateChanges({
        clientName: created.clientName,
        clientPhone: created.clientPhone,
        service: created.service,
        employee: created.employee,
        doctor: created.doctor,
        date: created.date,
        time: created.time,
        duration: created.duration,
        status: created.status,
        price: created.price,
        notes: created.notes,
      }),
      relatedEntities: buildRelatedEntities({
        clientId: created.clientId,
        employeeId: created.employeeId,
        doctorId: created.doctorId,
      }),
    });

    return success(
      {
        ...created,
        price: parseFloat(created.price),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return serverError();
  }
}
