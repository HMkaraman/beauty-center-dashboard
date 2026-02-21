import { db } from "@/db/db";
import { inAppNotifications, userNotifications, notificationPreferences, users } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export type NotificationCategory = "appointment" | "inventory" | "financial" | "staff" | "client" | "system" | "marketing";
export type NotificationPriority = "critical" | "high" | "medium" | "low";

interface DispatchNotificationParams {
  tenantId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  titleEn?: string;
  body?: string;
  bodyEn?: string;
  icon?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
  targetRoles?: string[];
  targetUserIds?: string[];
}

export async function dispatchNotification(params: DispatchNotificationParams): Promise<void> {
  try {
    const {
      tenantId,
      category,
      priority,
      title,
      titleEn,
      body,
      bodyEn,
      icon,
      actionUrl,
      entityType,
      entityId,
      actorId,
      actorName,
      metadata,
      targetRoles,
      targetUserIds,
    } = params;

    // 1. Insert the notification
    const [notification] = await db
      .insert(inAppNotifications)
      .values({
        tenantId,
        category,
        priority,
        title,
        titleEn,
        body,
        bodyEn,
        icon,
        actionUrl,
        entityType,
        entityId,
        actorId,
        actorName,
        metadata,
      })
      .returning();

    if (!notification) return;

    // 2. Find eligible users
    const eligibleUserIds = new Set<string>();

    // Query users by role
    if (targetRoles && targetRoles.length > 0) {
      const roleUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.tenantId, tenantId),
            inArray(users.role, targetRoles as ("owner" | "admin" | "manager" | "staff" | "receptionist")[])
          )
        );
      for (const u of roleUsers) {
        eligibleUserIds.add(u.id);
      }
    }

    // Add specific targeted users
    if (targetUserIds) {
      for (const uid of targetUserIds) {
        eligibleUserIds.add(uid);
      }
    }

    // Exclude the actor
    if (actorId) {
      eligibleUserIds.delete(actorId);
    }

    if (eligibleUserIds.size === 0) return;

    // 3. Check notification preferences
    const userIdArray = Array.from(eligibleUserIds);
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.tenantId, tenantId),
          eq(notificationPreferences.category, category),
          inArray(notificationPreferences.userId, userIdArray)
        )
      );

    // Build a set of users who have explicitly disabled this category
    const disabledUsers = new Set<string>();
    for (const pref of prefs) {
      if (pref.inAppEnabled === 0) {
        disabledUsers.add(pref.userId);
      }
    }

    // Filter out disabled users
    const finalUserIds = userIdArray.filter((uid) => !disabledUsers.has(uid));

    if (finalUserIds.length === 0) return;

    // 4. Fan-out: insert user_notifications
    await db.insert(userNotifications).values(
      finalUserIds.map((userId) => ({
        notificationId: notification.id,
        userId,
      }))
    );
  } catch (error) {
    // Fire-and-forget: never fail the parent operation
    console.error("Notification dispatch error:", error);
  }
}
