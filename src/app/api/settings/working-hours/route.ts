import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { workingHours } from "@/db/schema";
import { workingHoursSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { z } from "zod";

const workingHoursArraySchema = z
  .array(workingHoursSchema)
  .length(7, "Must provide exactly 7 entries (one per day of the week)");

export async function GET(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const rows = await db
      .select()
      .from(workingHours)
      .where(eq(workingHours.tenantId, tenantId));

    // Sort by dayOfWeek for consistent ordering
    rows.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return success(rows);
  } catch (error) {
    console.error("GET /api/settings/working-hours error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = workingHoursArraySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    // Delete existing working hours for this tenant
    await db
      .delete(workingHours)
      .where(eq(workingHours.tenantId, tenantId));

    // Insert new working hours
    const newRows = await db
      .insert(workingHours)
      .values(
        validated.map((entry: { dayOfWeek: number; startTime: string; endTime: string; isOpen: boolean }) => ({
          tenantId,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          endTime: entry.endTime,
          isOpen: entry.isOpen ? 1 : 0,
        }))
      )
      .returning();

    // Sort by dayOfWeek for consistent ordering
    newRows.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return success(newRows);
  } catch (error) {
    console.error("PUT /api/settings/working-hours error:", error);
    return serverError();
  }
}
