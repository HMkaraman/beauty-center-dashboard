import { integer, jsonb, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const notificationCategoryEnum = pgEnum("notification_category", [
  "appointment",
  "inventory",
  "financial",
  "staff",
  "client",
  "system",
  "marketing",
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const inAppNotifications = pgTable("in_app_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  category: notificationCategoryEnum("category").notNull(),
  priority: notificationPriorityEnum("priority").notNull().default("medium"),
  title: varchar("title", { length: 500 }).notNull(),
  titleEn: varchar("title_en", { length: 500 }),
  body: text("body"),
  bodyEn: text("body_en"),
  icon: varchar("icon", { length: 50 }),
  actionUrl: varchar("action_url", { length: 500 }),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: text("entity_id"),
  actorId: text("actor_id"),
  actorName: varchar("actor_name", { length: 255 }),
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InAppNotificationRecord = typeof inAppNotifications.$inferSelect;
export type NewInAppNotification = typeof inAppNotifications.$inferInsert;

export const userNotifications = pgTable("user_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  notificationId: text("notification_id").notNull().references(() => inAppNotifications.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isRead: integer("is_read").notNull().default(0),
  readAt: timestamp("read_at"),
  isArchived: integer("is_archived").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserNotificationRecord = typeof userNotifications.$inferSelect;
export type NewUserNotification = typeof userNotifications.$inferInsert;

export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  category: notificationCategoryEnum("category").notNull(),
  inAppEnabled: integer("in_app_enabled").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type NotificationPreferenceRecord = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
