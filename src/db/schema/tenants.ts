import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  currency: varchar("currency", { length: 10 }).notNull().default("SAR"),
  locale: varchar("locale", { length: 5 }).notNull().default("ar"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Riyadh"),
  logo: text("logo"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
