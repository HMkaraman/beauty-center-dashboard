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
import { inventoryItems } from "@/db/schema";
import { inventoryItemSchema } from "@/lib/validations";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset, search } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const conditions = [eq(inventoryItems.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(inventoryItems.name, `%${search}%`)} OR ${ilike(inventoryItems.sku, `%${search}%`)} OR ${ilike(inventoryItems.category, `%${search}%`)})`
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(inventoryItems)
      .where(whereClause);

    const rows = await db
      .select()
      .from(inventoryItems)
      .where(whereClause)
      .orderBy(desc(inventoryItems.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((row) => ({
      ...row,
      unitPrice: parseFloat(row.unitPrice),
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

    const [newItem] = await db
      .insert(inventoryItems)
      .values({
        tenantId,
        name: validated.name,
        sku: validated.sku,
        category: validated.category,
        quantity: validated.quantity,
        unitPrice: String(validated.unitPrice),
        reorderLevel: validated.reorderLevel,
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
      },
      201
    );
  } catch (error) {
    console.error("POST /api/inventory error:", error);
    return serverError();
  }
}
