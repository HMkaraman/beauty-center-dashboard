import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const reportTypeEnum = pgEnum("report_type", [
  "financial",
  "appointments",
  "clients",
  "employees",
  "inventory",
  "marketing",
]);

export const reports = pgTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: reportTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  lastGenerated: timestamp("last_generated"),
  downloads: integer("downloads").notNull().default(0),
  fileSize: varchar("file_size", { length: 50 }),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReportRecord = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
