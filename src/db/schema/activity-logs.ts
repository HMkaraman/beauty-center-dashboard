import { integer, jsonb, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const activityEntityTypeEnum = pgEnum("activity_entity_type", [
  "appointment",
  "client",
  "employee",
  "doctor",
  "invoice",
  "expense",
  "service",
  "inventory_item",
  "campaign",
  "transaction",
]);

export const activityActionEnum = pgEnum("activity_action", [
  "create",
  "update",
  "delete",
  "note",
]);

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  entityType: activityEntityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: activityActionEnum("action").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: varchar("user_name", { length: 255 }),
  changes: jsonb("changes"),
  content: text("content"),
  entityLabel: varchar("entity_label", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogAttachments = pgTable("activity_log_attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  activityLogId: text("activity_log_id").notNull().references(() => activityLogs.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 500 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogRelations = pgTable("activity_log_relations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  activityLogId: text("activity_log_id").notNull().references(() => activityLogs.id, { onDelete: "cascade" }),
  entityType: activityEntityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
});

export type ActivityLogRecord = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type ActivityLogAttachmentRecord = typeof activityLogAttachments.$inferSelect;
export type NewActivityLogAttachment = typeof activityLogAttachments.$inferInsert;
export type ActivityLogRelationRecord = typeof activityLogRelations.$inferSelect;
export type NewActivityLogRelation = typeof activityLogRelations.$inferInsert;
