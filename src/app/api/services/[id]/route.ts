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
import { services } from "@/db/schema";
import { serviceSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

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
    const result = serviceSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

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

    return success({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return serverError();
  }
}
