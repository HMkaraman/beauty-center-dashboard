import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, notFound, success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { expenseCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().optional(),
  code: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const [existing] = await db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, tenantId)));

    if (!existing) return notFound("Category not found");

    const updateValues: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateValues.name = parsed.data.name;
    if (parsed.data.nameEn !== undefined) updateValues.nameEn = parsed.data.nameEn;
    if (parsed.data.code !== undefined) updateValues.code = parsed.data.code;
    if (parsed.data.parentId !== undefined) updateValues.parentId = parsed.data.parentId;
    if (parsed.data.isActive !== undefined) updateValues.isActive = parsed.data.isActive ? 1 : 0;
    if (parsed.data.sortOrder !== undefined) updateValues.sortOrder = parsed.data.sortOrder;

    const [updated] = await db
      .update(expenseCategories)
      .set(updateValues)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, tenantId)))
      .returning();

    return success({ ...updated, isDefault: updated.isDefault === 1, isActive: updated.isActive === 1 });
  } catch (error) {
    console.error("PATCH /api/expense-categories/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [existing] = await db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, tenantId)));

    if (!existing) return notFound("Category not found");

    await db
      .delete(expenseCategories)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.tenantId, tenantId)));

    return success({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/expense-categories/[id] error:", error);
    return serverError();
  }
}
