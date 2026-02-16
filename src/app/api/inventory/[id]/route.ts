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
import { inventoryItems } from "@/db/schema";
import { inventoryItemSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));

    if (!item) return notFound("Inventory item not found");

    return success({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
    });
  } catch (error) {
    console.error("GET /api/inventory/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const body = await req.json();
    const parsed = inventoryItemSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;

    const [existing] = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));

    if (!existing) return notFound("Inventory item not found");

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.name !== undefined) updateValues.name = validated.name;
    if (validated.sku !== undefined) updateValues.sku = validated.sku;
    if (validated.category !== undefined) updateValues.category = validated.category;
    if (validated.quantity !== undefined) updateValues.quantity = validated.quantity;
    if (validated.unitPrice !== undefined) updateValues.unitPrice = String(validated.unitPrice);
    if (validated.reorderLevel !== undefined) updateValues.reorderLevel = validated.reorderLevel;

    const [updated] = await db
      .update(inventoryItems)
      .set(updateValues)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)))
      .returning();

    return success({
      ...updated,
      unitPrice: parseFloat(updated.unitPrice),
    });
  } catch (error) {
    console.error("PATCH /api/inventory/[id] error:", error);
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
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));

    if (!existing) return notFound("Inventory item not found");

    await db
      .delete(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));

    return success({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/inventory/[id] error:", error);
    return serverError();
  }
}
