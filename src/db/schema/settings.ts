import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const tenantSettings = pgTable("tenant_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }).unique(),
  businessName: varchar("business_name", { length: 255 }),
  businessNameEn: varchar("business_name_en", { length: 255 }),
  taxRate: integer("tax_rate").default(15),
  nextInvoiceNumber: integer("next_invoice_number").default(1),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  country: varchar("country", { length: 10 }),
  taxEnabled: integer("tax_enabled").default(1),
  exchangeRates: text("exchange_rates"),
  smsEnabled: integer("sms_enabled").default(0),
  emailEnabled: integer("email_enabled").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workingHours = pgTable("working_hours", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  endTime: varchar("end_time", { length: 5 }).notNull(),
  isOpen: integer("is_open").default(1),
});

export type TenantSettingsRecord = typeof tenantSettings.$inferSelect;
export type NewTenantSettings = typeof tenantSettings.$inferInsert;
export type WorkingHoursRecord = typeof workingHours.$inferSelect;
export type NewWorkingHours = typeof workingHours.$inferInsert;
