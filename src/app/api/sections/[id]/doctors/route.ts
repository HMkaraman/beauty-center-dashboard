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
import { sections, doctorSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const setDoctorsSchema = z.object({
  doctorIds: z.array(z.string()),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = setDoctorsSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    // Verify section belongs to tenant
    const [section] = await db
      .select()
      .from(sections)
      .where(and(eq(sections.id, id), eq(sections.tenantId, session.user.tenantId)));

    if (!section) return notFound("Section not found");

    const { doctorIds } = result.data;

    // Replace all doctor assignments
    await db.delete(doctorSections).where(eq(doctorSections.sectionId, id));

    if (doctorIds.length > 0) {
      await db.insert(doctorSections).values(
        doctorIds.map((doctorId) => ({
          doctorId,
          sectionId: id,
        }))
      );
    }

    return success({ message: "Doctors updated successfully" });
  } catch (error) {
    console.error("PUT /api/sections/[id]/doctors error:", error);
    return serverError();
  }
}
