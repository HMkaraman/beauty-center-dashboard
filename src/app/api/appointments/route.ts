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
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { checkConflict } from "@/lib/business-logic/scheduling";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

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
          status as "confirmed" | "pending" | "cancelled" | "completed" | "no-show"
        )
      );
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

    // Check for scheduling conflicts before creating
    const conflict = await checkConflict({
      tenantId: session.user.tenantId,
      employeeId: validated.employeeId,
      employee: validated.employee,
      date: validated.date,
      time: validated.time,
      duration: validated.duration,
    });

    if (conflict.hasConflict) {
      return badRequest(
        `Employee has a conflicting appointment at ${conflict.conflictingAppointment?.time} (${conflict.conflictingAppointment?.service})`
      );
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
        employee: validated.employee,
        date: validated.date,
        time: validated.time,
        duration: validated.duration,
        status: validated.status,
        price: String(validated.price),
        notes: validated.notes,
      })
      .returning();

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
