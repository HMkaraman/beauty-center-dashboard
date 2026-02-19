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
import { doctors } from "@/db/schema";
import { doctorSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, session.user.tenantId)));

    if (!doctor) return notFound("Doctor not found");

    return success({
      ...doctor,
      rating: doctor.rating ? parseFloat(doctor.rating) : 0,
      salary: doctor.salary ? parseFloat(doctor.salary) : 0,
      commissionRate: doctor.commissionRate ? parseFloat(doctor.commissionRate) : 0,
    });
  } catch (error) {
    console.error("GET /api/doctors/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = doctorSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // Fetch existing record for change tracking
    const [existing] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, session.user.tenantId)));

    if (!existing) return notFound("Doctor not found");

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };
    if (validated.salary !== undefined) {
      updateData.salary = String(validated.salary);
    }
    if (validated.commissionRate !== undefined) {
      updateData.commissionRate = String(validated.commissionRate);
    }

    const [updated] = await db
      .update(doctors)
      .set(updateData)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Doctor not found");

    logActivity({
      session,
      entityType: "doctor",
      entityId: id,
      action: "update",
      entityLabel: `${updated.name} - ${updated.specialty}`,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    return success({
      ...updated,
      rating: updated.rating ? parseFloat(updated.rating) : 0,
      salary: updated.salary ? parseFloat(updated.salary) : 0,
      commissionRate: updated.commissionRate ? parseFloat(updated.commissionRate) : 0,
    });
  } catch (error) {
    console.error("PATCH /api/doctors/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(doctors)
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Doctor not found");

    logActivity({
      session,
      entityType: "doctor",
      entityId: id,
      action: "delete",
      entityLabel: `${deleted.name} - ${deleted.specialty}`,
    });

    return success({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/doctors/[id] error:", error);
    return serverError();
  }
}
