import { NextRequest } from "next/server";
import { getAuthSession, unauthorized, badRequest, success, serverError, notFound } from "@/lib/api-utils";
import { db } from "@/db/db";
import { serviceInventoryRequirements, services } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - list inventory requirements for a service
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const requirements = await db
      .select()
      .from(serviceInventoryRequirements)
      .where(eq(serviceInventoryRequirements.serviceId, id));

    return success(requirements);
  } catch (error) {
    console.error("GET /api/services/[id]/inventory error:", error);
    return serverError();
  }
}

// PUT - replace all inventory requirements for a service
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();

    if (!Array.isArray(body.requirements)) {
      return badRequest("requirements array is required");
    }

    // Delete existing requirements
    await db
      .delete(serviceInventoryRequirements)
      .where(eq(serviceInventoryRequirements.serviceId, id));

    // Insert new requirements
    if (body.requirements.length > 0) {
      await db.insert(serviceInventoryRequirements).values(
        body.requirements.map((r: { inventoryItemId: string; quantityRequired: number }) => ({
          serviceId: id,
          inventoryItemId: r.inventoryItemId,
          quantityRequired: r.quantityRequired || 1,
        }))
      );
    }

    const updated = await db
      .select()
      .from(serviceInventoryRequirements)
      .where(eq(serviceInventoryRequirements.serviceId, id));

    return success(updated);
  } catch (error) {
    console.error("PUT /api/services/[id]/inventory error:", error);
    return serverError();
  }
}
