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
import { clients } from "@/db/schema";
import { clientSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { logActivity } from "@/lib/activity-logger";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.tenantId, session.user.tenantId)));

    if (!client) return notFound("Client not found");

    return success(client);
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await req.json();
    const result = clientSchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    // Fetch existing record for change tracking
    const [existing] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.tenantId, session.user.tenantId)));

    if (!existing) return notFound("Client not found");

    const [updated] = await db
      .update(clients)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.tenantId, session.user.tenantId)))
      .returning();

    if (!updated) return notFound("Client not found");

    logActivity({
      session,
      entityType: "client",
      entityId: id,
      action: "update",
      entityLabel: updated.name,
      oldRecord: existing as unknown as Record<string, unknown>,
      newData: validated as unknown as Record<string, unknown>,
    });

    return success(updated);
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [deleted] = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.tenantId, session.user.tenantId)))
      .returning();

    if (!deleted) return notFound("Client not found");

    logActivity({
      session,
      entityType: "client",
      entityId: id,
      action: "delete",
      entityLabel: deleted.name,
    });

    return success({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return serverError();
  }
}
