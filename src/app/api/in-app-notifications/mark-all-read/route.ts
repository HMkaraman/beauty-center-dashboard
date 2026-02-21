import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications, inAppNotifications } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const VALID_CATEGORIES = ["appointment", "inventory", "financial", "staff", "client", "system", "marketing"];
    if (category && !VALID_CATEGORIES.includes(category)) {
      return badRequest("Invalid category");
    }

    if (category) {
      // Get notification IDs that match the category
      const notificationIds = await db
        .select({ id: inAppNotifications.id })
        .from(inAppNotifications)
        .where(
          eq(inAppNotifications.category, category as "appointment" | "inventory" | "financial" | "staff" | "client" | "system" | "marketing")
        );

      const ids = notificationIds.map((n) => n.id);

      if (ids.length > 0) {
        await db
          .update(userNotifications)
          .set({ isRead: 1, readAt: new Date() })
          .where(
            and(
              eq(userNotifications.userId, session.user.id),
              eq(userNotifications.isRead, 0),
              inArray(userNotifications.notificationId, ids)
            )
          );
      }
    } else {
      await db
        .update(userNotifications)
        .set({ isRead: 1, readAt: new Date() })
        .where(
          and(
            eq(userNotifications.userId, session.user.id),
            eq(userNotifications.isRead, 0)
          )
        );
    }

    return success({ message: "All marked as read" });
  } catch (error) {
    console.error("PATCH /api/in-app-notifications/mark-all-read error:", error);
    return serverError();
  }
}
