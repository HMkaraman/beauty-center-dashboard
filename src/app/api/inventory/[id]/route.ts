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
import { inventoryItems, inventoryCategories } from "@/db/schema";
import { inventoryItemSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";
import { triggerNotification } from "@/lib/notification-events";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    const [item] = await db
      .select({
        id: inventoryItems.id,
        tenantId: inventoryItems.tenantId,
        name: inventoryItems.name,
        nameEn: inventoryItems.nameEn,
        sku: inventoryItems.sku,
        barcode: inventoryItems.barcode,
        description: inventoryItems.description,
        image: inventoryItems.image,
        brand: inventoryItems.brand,
        categoryId: inventoryItems.categoryId,
        categoryName: inventoryCategories.name,
        category: inventoryItems.category,
        productType: inventoryItems.productType,
        unitOfMeasure: inventoryItems.unitOfMeasure,
        unitsPerPackage: inventoryItems.unitsPerPackage,
        quantity: inventoryItems.quantity,
        unitPrice: inventoryItems.unitPrice,
        costPrice: inventoryItems.costPrice,
        reorderLevel: inventoryItems.reorderLevel,
        expiryDate: inventoryItems.expiryDate,
        batchNumber: inventoryItems.batchNumber,
        isRetail: inventoryItems.isRetail,
        isActive: inventoryItems.isActive,
        supplierName: inventoryItems.supplierName,
        storageConditions: inventoryItems.storageConditions,
        notes: inventoryItems.notes,
        status: inventoryItems.status,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
      })
      .from(inventoryItems)
      .leftJoin(inventoryCategories, eq(inventoryItems.categoryId, inventoryCategories.id))
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)));

    if (!item) return notFound("Inventory item not found");

    return success({
      ...item,
      unitPrice: parseFloat(item.unitPrice),
      costPrice: item.costPrice ? parseFloat(item.costPrice) : null,
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
    if (validated.nameEn !== undefined) updateValues.nameEn = validated.nameEn;
    if (validated.sku !== undefined) updateValues.sku = validated.sku;
    if (validated.barcode !== undefined) updateValues.barcode = validated.barcode;
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.image !== undefined) updateValues.image = validated.image;
    if (validated.brand !== undefined) updateValues.brand = validated.brand;
    if (validated.categoryId !== undefined) {
      updateValues.categoryId = validated.categoryId;
      // Also update the category name
      if (validated.categoryId) {
        const [cat] = await db
          .select({ name: inventoryCategories.name })
          .from(inventoryCategories)
          .where(eq(inventoryCategories.id, validated.categoryId));
        if (cat) updateValues.category = cat.name;
      }
    }
    if (validated.category !== undefined) updateValues.category = validated.category;
    if (validated.productType !== undefined) updateValues.productType = validated.productType;
    if (validated.unitOfMeasure !== undefined) updateValues.unitOfMeasure = validated.unitOfMeasure;
    if (validated.unitsPerPackage !== undefined) updateValues.unitsPerPackage = validated.unitsPerPackage;
    if (validated.quantity !== undefined) updateValues.quantity = validated.quantity;
    if (validated.unitPrice !== undefined) updateValues.unitPrice = String(validated.unitPrice);
    if (validated.costPrice !== undefined) updateValues.costPrice = validated.costPrice != null ? String(validated.costPrice) : null;
    if (validated.reorderLevel !== undefined) updateValues.reorderLevel = validated.reorderLevel;
    if (validated.expiryDate !== undefined) updateValues.expiryDate = validated.expiryDate;
    if (validated.batchNumber !== undefined) updateValues.batchNumber = validated.batchNumber;
    if (validated.isRetail !== undefined) updateValues.isRetail = validated.isRetail ? 1 : 0;
    if (validated.isActive !== undefined) updateValues.isActive = validated.isActive ? 1 : 0;
    if (validated.supplierName !== undefined) updateValues.supplierName = validated.supplierName;
    if (validated.storageConditions !== undefined) updateValues.storageConditions = validated.storageConditions;
    if (validated.notes !== undefined) updateValues.notes = validated.notes;

    const [updated] = await db
      .update(inventoryItems)
      .set(updateValues)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.tenantId, tenantId)))
      .returning();

    logActivity({
      session,
      entityType: "inventory_item",
      entityId: id,
      action: "update",
      entityLabel: `${updated.name} (${updated.sku})`,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    // Low stock alert
    if (
      updated.reorderLevel != null &&
      updated.quantity != null &&
      updated.quantity <= updated.reorderLevel
    ) {
      triggerNotification({
        eventKey: "inventory_low_stock",
        tenantId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "inventory_item",
        entityId: id,
        context: {
          itemName: updated.name,
          quantity: String(updated.quantity),
          reorderLevel: String(updated.reorderLevel),
        },
      });
    }

    return success({
      ...updated,
      unitPrice: parseFloat(updated.unitPrice),
      costPrice: updated.costPrice ? parseFloat(updated.costPrice) : null,
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

    logActivity({
      session,
      entityType: "inventory_item",
      entityId: id,
      action: "delete",
      entityLabel: `${existing.name} (${existing.sku})`,
    });

    return success({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/inventory/[id] error:", error);
    return serverError();
  }
}
