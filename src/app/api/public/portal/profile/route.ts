import { NextRequest } from "next/server";
import { db } from "@/db/db";
import { clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  success,
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from "@/lib/api-utils";
import { getClientFromToken } from "@/lib/client-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = getClientFromToken(req.headers.get("authorization"));
    if (!auth) return unauthorized();

    const { clientId, tenantId } = auth;

    const [client] = await db
      .select({
        id: clients.id,
        name: clients.name,
        phone: clients.phone,
        email: clients.email,
      })
      .from(clients)
      .where(
        and(eq(clients.id, clientId), eq(clients.tenantId, tenantId))
      )
      .limit(1);

    if (!client) {
      return notFound("Client not found");
    }

    return success(client);
  } catch (error) {
    console.error("GET /api/public/portal/profile error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = getClientFromToken(req.headers.get("authorization"));
    if (!auth) return unauthorized();

    const { clientId, tenantId } = auth;
    const body = await req.json();
    const { name, email } = body;

    if (!name && !email) {
      return badRequest("At least one field (name or email) is required");
    }

    // Build update object
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    await db
      .update(clients)
      .set(updateData)
      .where(
        and(eq(clients.id, clientId), eq(clients.tenantId, tenantId))
      );

    return success({ success: true });
  } catch (error) {
    console.error("PATCH /api/public/portal/profile error:", error);
    return serverError();
  }
}
