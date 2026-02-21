import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
  getPaginationParams,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { userNotifications, inAppNotifications } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset } = getPaginationParams(req);
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    const conditions = [eq(userNotifications.userId, session.user.id)];

    if (category) {
      conditions.push(
        eq(inAppNotifications.category, category as "appointment" | "inventory" | "financial" | "staff" | "client" | "system" | "marketing")
      );
    }

    if (unreadOnly) {
      conditions.push(eq(userNotifications.isRead, 0));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: userNotifications.id,
          notificationId: userNotifications.notificationId,
          isRead: userNotifications.isRead,
          readAt: userNotifications.readAt,
          createdAt: userNotifications.createdAt,
          category: inAppNotifications.category,
          priority: inAppNotifications.priority,
          title: inAppNotifications.title,
          titleEn: inAppNotifications.titleEn,
          body: inAppNotifications.body,
          bodyEn: inAppNotifications.bodyEn,
          icon: inAppNotifications.icon,
          actionUrl: inAppNotifications.actionUrl,
          entityType: inAppNotifications.entityType,
          entityId: inAppNotifications.entityId,
          actorName: inAppNotifications.actorName,
          metadata: inAppNotifications.metadata,
        })
        .from(userNotifications)
        .innerJoin(inAppNotifications, eq(userNotifications.notificationId, inAppNotifications.id))
        .where(whereClause)
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(userNotifications)
        .innerJoin(inAppNotifications, eq(userNotifications.notificationId, inAppNotifications.id))
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return success({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/in-app-notifications error:", error);
    return serverError();
  }
}
