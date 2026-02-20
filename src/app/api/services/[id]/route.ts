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
import { services, serviceCategories } from "@/db/schema";
import { serviceBaseSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.tenantId, session.user.tenantId)));

    if (!service) return notFound("Service not found");

    return success({
      ...service,
      price: parseFloat(service.price),
    });
  } catch (error) {
    console.error("GET /api/services/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = serviceBaseSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // Fetch existing record for change tracking
    const [existing] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.tenantId, session.user.tenantId)));

    if (!existing) return notFound("Service not found");

    // If categoryId is provided, resolve category name from DB
    if (validated.categoryId) {
      const [cat] = await db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.id, validated.categoryId));
      if (cat) {
        validated.category = cat.name;
      }
    }

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.price !== undefined) {
      updateData.price = String(validated.price);
    }

    const [updated] = await db
      .update(services)
      .set(updateData)
      .where(and(eq(services.id, id), eq(services.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Service not found");

    logActivity({
      session,
      entityType: "service",
      entityId: id,
      action: "update",
      entityLabel: updated.name,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    return success({
      ...updated,
      price: parseFloat(updated.price),
    });
  } catch (error) {
    console.error("PATCH /api/services/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Service not found");

    logActivity({
      session,
      entityType: "service",
      entityId: id,
      action: "delete",
      entityLabel: deleted.name,
    });

    return success({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return serverError();
  }
}
