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
import { serviceCategories } from "@/db/schema";
import { serviceCategorySchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = serviceCategorySchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [updated] = await db
      .update(serviceCategories)
      .set(validated)
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Category not found");

    return success(updated);
  } catch (error) {
    console.error("PATCH /api/service-categories/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(serviceCategories)
      .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Category not found");

    return success({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/service-categories/[id] error:", error);
    return serverError();
  }
}
