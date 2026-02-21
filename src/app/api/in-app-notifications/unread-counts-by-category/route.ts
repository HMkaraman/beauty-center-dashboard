import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications, inAppNotifications } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const rows = await db
      .select({
        category: inAppNotifications.category,
        count: count(),
      })
      .from(userNotifications)
      .innerJoin(inAppNotifications, eq(userNotifications.notificationId, inAppNotifications.id))
      .where(
        and(
          eq(userNotifications.userId, session.user.id),
          eq(userNotifications.isRead, 0),
          eq(userNotifications.isArchived, 0)
        )
      )
      .groupBy(inAppNotifications.category);

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.category] = row.count;
    }

    return success(result);
  } catch (error) {
    console.error("GET /api/in-app-notifications/unread-counts-by-category error:", error);
    return serverError();
  }
}
