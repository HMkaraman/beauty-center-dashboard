import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { sections } from "./sections";

export const serviceStatusEnum = pgEnum("service_status", ["active", "inactive"]);

export const serviceCategories = pgTable("service_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  sectionId: text("section_id").references(() => sections.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  categoryId: text("category_id").references(() => serviceCategories.id, { onDelete: "set null" }),
  category: varchar("category", { length: 255 }).notNull(),
  duration: integer("duration").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  status: serviceStatusEnum("status").notNull().default("active"),
  description: text("description"),
  // Consumption tracking fields
  serviceType: varchar("service_type", { length: 20 }), // "laser" | "injectable" | null (general)
  laserMinShots: integer("laser_min_shots"),
  laserMaxShots: integer("laser_max_shots"),
  injectableUnit: varchar("injectable_unit", { length: 10 }), // "units" | "cc"
  injectableExpiryDays: integer("injectable_expiry_days"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServiceRecord = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceCategoryRecord = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
