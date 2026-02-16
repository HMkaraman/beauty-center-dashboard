import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const notificationTypeEnum = pgEnum("notification_type", [
  "appointment_confirmation",
  "appointment_reminder",
  "invoice_receipt",
  "low_stock_alert",
  "custom",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "sms",
  "email",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "sent",
  "failed",
  "pending",
]);

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body").notNull(),
  status: notificationStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NotificationRecord = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
