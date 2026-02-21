import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const inventoryStatusEnum = pgEnum("inventory_status", [
  "in-stock",
  "low-stock",
  "out-of-stock",
]);

export const productTypeEnum = pgEnum("product_type", [
  "injectable",
  "skincare",
  "consumable",
  "retail",
  "equipment",
  "device_supply",
  "medication",
  "chemical",
]);

export const storageConditionEnum = pgEnum("storage_condition", [
  "ambient",
  "refrigerated",
  "frozen",
]);

export const inventoryCategories = pgTable("inventory_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  color: varchar("color", { length: 20 }),
  isActive: integer("is_active").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  sku: varchar("sku", { length: 100 }).notNull(),
  barcode: varchar("barcode", { length: 100 }),
  description: text("description"),
  image: text("image"),
  brand: varchar("brand", { length: 255 }),
  categoryId: text("category_id").references(() => inventoryCategories.id, { onDelete: "set null" }),
  category: varchar("category", { length: 100 }).notNull(),
  productType: productTypeEnum("product_type"),
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
  unitsPerPackage: integer("units_per_package"),
  quantity: integer("quantity").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  reorderLevel: integer("reorder_level").default(10),
  expiryDate: varchar("expiry_date", { length: 10 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  isRetail: integer("is_retail").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  supplierName: varchar("supplier_name", { length: 255 }),
  storageConditions: storageConditionEnum("storage_conditions"),
  notes: text("notes"),
  status: inventoryStatusEnum("status").notNull().default("in-stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  appointmentId: text("appointment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryCategoryRecord = typeof inventoryCategories.$inferSelect;
export type NewInventoryCategory = typeof inventoryCategories.$inferInsert;
export type InventoryItemRecord = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type InventoryTransactionRecord = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
