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
import { sections } from "@/db/schema";
import { sectionSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [section] = await db
      .select()
      .from(sections)
      .where(and(eq(sections.id, id), eq(sections.tenantId, session.user.tenantId)));

    if (!section) return notFound("Section not found");

    return success(section);
  } catch (error) {
    console.error("GET /api/sections/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = sectionSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [updated] = await db
      .update(sections)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(sections.id, id), eq(sections.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Section not found");

    return success(updated);
  } catch (error) {
    console.error("PATCH /api/sections/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(sections)
      .where(and(eq(sections.id, id), eq(sections.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Section not found");

    return success({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/sections/[id] error:", error);
    return serverError();
  }
}
