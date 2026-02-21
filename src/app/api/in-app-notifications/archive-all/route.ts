import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    await db
      .update(userNotifications)
      .set({ isArchived: 1 })
      .where(
        and(
          eq(userNotifications.userId, session.user.id),
          eq(userNotifications.isRead, 1),
          eq(userNotifications.isArchived, 0)
        )
      );

    return success({ message: "All read notifications archived" });
  } catch (error) {
    console.error("PATCH /api/in-app-notifications/archive-all error:", error);
    return serverError();
  }
}
