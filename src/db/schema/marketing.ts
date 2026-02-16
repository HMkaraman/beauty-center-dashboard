import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const campaignStatusEnum = pgEnum("campaign_status", [
  "active",
  "paused",
  "completed",
  "draft",
]);

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 100 }).notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }),
  budget: numeric("budget", { precision: 10, scale: 2 }).notNull(),
  reach: integer("reach").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CampaignRecord = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
