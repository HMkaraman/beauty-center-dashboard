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

    const [updated] = await db
      .update(doctors)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(doctors.id, id), eq(doctors.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Doctor not found");

    return success({
      ...updated,
      rating: updated.rating ? parseFloat(updated.rating) : 0,
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

    return success({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/doctors/[id] error:", error);
    return serverError();
  }
}
