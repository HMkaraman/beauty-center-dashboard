import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const [result] = await db
      .select({ count: count() })
      .from(userNotifications)
      .where(
        and(
          eq(userNotifications.userId, session.user.id),
          eq(userNotifications.isRead, 0)
        )
      );

    return success({ count: result?.count ?? 0 });
  } catch (error) {
    console.error("GET /api/in-app-notifications/unread-count error:", error);
    return serverError();
  }
}
