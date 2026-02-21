import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;

    const [updated] = await db
      .update(userNotifications)
      .set({ isArchived: 1 })
      .where(
        and(
          eq(userNotifications.id, id),
          eq(userNotifications.userId, session.user.id)
        )
      )
      .returning();

    if (!updated) return notFound("Notification not found");

    return success({ message: "Archived" });
  } catch (error) {
    console.error("PATCH /api/in-app-notifications/[id]/archive error:", error);
    return serverError();
  }
}
