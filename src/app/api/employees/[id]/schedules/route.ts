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
import { employees, employeeSchedules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Verify employee exists and belongs to tenant
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));

    if (!employee) return notFound("Employee not found");

    const schedules = await db
      .select()
      .from(employeeSchedules)
      .where(
        and(
          eq(employeeSchedules.employeeId, id),
          eq(employeeSchedules.tenantId, tenantId)
        )
      );

    return success(schedules);
  } catch (error) {
    console.error("GET /api/employees/[id]/schedules error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Verify employee exists and belongs to tenant
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));

    if (!employee) return notFound("Employee not found");

    const body = await req.json();

    if (!Array.isArray(body) || body.length !== 7) {
      return badRequest("Must provide an array of exactly 7 schedule entries (one per day of week)");
    }

    // Validate each entry
    for (const entry of body) {
      if (
        typeof entry.dayOfWeek !== "number" ||
        entry.dayOfWeek < 0 ||
        entry.dayOfWeek > 6
      ) {
        return badRequest("Each entry must have a valid dayOfWeek (0-6)");
      }
      if (typeof entry.startTime !== "string" || !/^\d{2}:\d{2}$/.test(entry.startTime)) {
        return badRequest("Each entry must have a valid startTime (HH:MM)");
      }
      if (typeof entry.endTime !== "string" || !/^\d{2}:\d{2}$/.test(entry.endTime)) {
        return badRequest("Each entry must have a valid endTime (HH:MM)");
      }
    }

    // Delete existing schedules and insert new ones
    await db
      .delete(employeeSchedules)
      .where(
        and(
          eq(employeeSchedules.employeeId, id),
          eq(employeeSchedules.tenantId, tenantId)
        )
      );

    const newSchedules = await db
      .insert(employeeSchedules)
      .values(
        body.map((entry: { dayOfWeek: number; startTime: string; endTime: string; isAvailable?: number }) => ({
          tenantId,
          employeeId: id,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          endTime: entry.endTime,
          isAvailable: entry.isAvailable ?? 1,
        }))
      )
      .returning();

    return success(newSchedules);
  } catch (error) {
    console.error("PUT /api/employees/[id]/schedules error:", error);
    return serverError();
  }
}
