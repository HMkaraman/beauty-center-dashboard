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
import { sections, employeeSections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const setEmployeesSchema = z.object({
  employeeIds: z.array(z.string()),
});

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = setEmployeesSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    // Verify section belongs to tenant
    const [section] = await db
      .select()
      .from(sections)
      .where(and(eq(sections.id, id), eq(sections.tenantId, session.user.tenantId)));

    if (!section) return notFound("Section not found");

    const { employeeIds } = result.data;

    // Replace all employee assignments
    await db.delete(employeeSections).where(eq(employeeSections.sectionId, id));

    if (employeeIds.length > 0) {
      await db.insert(employeeSections).values(
        employeeIds.map((employeeId) => ({
          employeeId,
          sectionId: id,
        }))
      );
    }

    return success({ message: "Employees updated successfully" });
  } catch (error) {
    console.error("PUT /api/sections/[id]/employees error:", error);
    return serverError();
  }
}
