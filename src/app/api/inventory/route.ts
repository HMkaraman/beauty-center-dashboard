import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  getPaginationParams,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { inventoryItems, inventoryCategories } from "@/db/schema";
import { inventoryItemSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count, lte } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const productType = searchParams.get("productType");
    const expiringBefore = searchParams.get("expiringBefore");

    const conditions = [eq(inventoryItems.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(inventoryItems.name, `%${search}%`)} OR ${ilike(inventoryItems.sku, `%${search}%`)} OR ${ilike(inventoryItems.category, `%${search}%`)} OR ${ilike(inventoryItems.brand, `%${search}%`)})`
      );
    }
    if (categoryId) {
      conditions.push(eq(inventoryItems.categoryId, categoryId));
    }
    if (productType) {
      conditions.push(sql`${inventoryItems.productType} = ${productType}`);
    }
    if (expiringBefore) {
      conditions.push(lte(inventoryItems.expiryDate, expiringBefore));
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(inventoryItems)
      .where(whereClause);

    const rows = await db
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
      .where(whereClause)
      .orderBy(desc(inventoryItems.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      ...row,
      unitPrice: parseFloat(row.unitPrice),
      costPrice: row.costPrice ? parseFloat(row.costPrice) : null,
    }));

    return success({
      data,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/inventory error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = inventoryItemSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i: { message: string }) => i.message).join(", "));
    }

    const validated = parsed.data;
    const tenantId = session.user.tenantId;

    // Resolve category name from categoryId
    let categoryName = validated.category || "";
    if (validated.categoryId) {
      const [cat] = await db
        .select({ name: inventoryCategories.name })
        .from(inventoryCategories)
        .where(eq(inventoryCategories.id, validated.categoryId));
      if (cat) categoryName = cat.name;
    }

    const [newItem] = await db
      .insert(inventoryItems)
      .values({
        tenantId,
        name: validated.name,
        nameEn: validated.nameEn,
        sku: validated.sku,
        barcode: validated.barcode,
        description: validated.description,
        image: validated.image,
        brand: validated.brand,
        categoryId: validated.categoryId,
        category: categoryName,
        productType: validated.productType,
        unitOfMeasure: validated.unitOfMeasure,
        unitsPerPackage: validated.unitsPerPackage,
        quantity: validated.quantity,
        unitPrice: String(validated.unitPrice),
        costPrice: validated.costPrice != null ? String(validated.costPrice) : null,
        reorderLevel: validated.reorderLevel,
        expiryDate: validated.expiryDate,
        batchNumber: validated.batchNumber,
        isRetail: validated.isRetail ? 1 : 0,
        isActive: validated.isActive === false ? 0 : 1,
        supplierName: validated.supplierName,
        storageConditions: validated.storageConditions,
        notes: validated.notes,
      })
      .returning();

    logActivity({
      session,
      entityType: "inventory_item",
      entityId: newItem.id,
      action: "create",
      entityLabel: `${newItem.name} (${newItem.sku})`,
    });

    return success(
      {
        ...newItem,
        unitPrice: parseFloat(newItem.unitPrice),
        costPrice: newItem.costPrice ? parseFloat(newItem.costPrice) : null,
      },
      201
    );
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return serverError();
  }
}
