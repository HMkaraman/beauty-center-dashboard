import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { inventoryCategories } from "@/db/schema";
import { inventoryCategorySchema } from "@/lib/validations";
import { eq, and, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const rows = await db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.tenantId, tenantId))
      .orderBy(asc(inventoryCategories.sortOrder), asc(inventoryCategories.name));

    return success({ data: rows });
  } catch (error) {
    console.error("GET /api/inventory/categories error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = inventoryCategorySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const [newCategory] = await db
      .insert(inventoryCategories)
      .values({
        tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        description: validated.description,
        color: validated.color,
        isActive: validated.isActive === false ? 0 : 1,
        sortOrder: validated.sortOrder ?? 0,
      })
      .returning();

    return success(newCategory, 201);
  } catch (error) {
    console.error("POST /api/inventory/categories error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return badRequest("Category ID is required");

    const parsed = inventoryCategorySchema.partial().safeParse(rest);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.name !== undefined) updateValues.name = validated.name;
    if (validated.nameEn !== undefined) updateValues.nameEn = validated.nameEn;
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.color !== undefined) updateValues.color = validated.color;
    if (validated.isActive !== undefined) updateValues.isActive = validated.isActive ? 1 : 0;
    if (validated.sortOrder !== undefined) updateValues.sortOrder = validated.sortOrder;

    const [updated] = await db
      .update(inventoryCategories)
      .set(updateValues)
      .where(and(eq(inventoryCategories.id, id), eq(inventoryCategories.tenantId, tenantId)))
      .returning();

    if (!updated) return badRequest("Category not found");

    return success(updated);
  } catch (error) {
    console.error("PUT /api/inventory/categories error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return badRequest("Category ID is required");

    const tenantId = session.user.tenantId;

    await db
      .delete(inventoryCategories)
      .where(and(eq(inventoryCategories.id, id), eq(inventoryCategories.tenantId, tenantId)));

    return success({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/inventory/categories error:", error);
    return serverError();
  }
}
