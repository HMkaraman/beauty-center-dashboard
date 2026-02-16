import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
  forbidden,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    // Only owner or admin can revoke API keys
    const role = session.user.role;
    if (!["owner", "admin"].includes(role)) {
      return forbidden("Only owners and admins can revoke API keys");
    }

    const { id } = await params;

    // Soft-delete: set isActive to 0
    const [revoked] = await db
      .update(apiKeys)
      .set({ isActive: 0 })
      .where(
        and(
          eq(apiKeys.id, id),
          eq(apiKeys.tenantId, session.user.tenantId)
        )
      )
      .returning();

    if (!revoked) return notFound("API key not found");

    return success({ success: true });
  } catch (error) {
    console.error("DELETE /api/settings/api-keys/[id] error:", error);
    return serverError();
  }
}
