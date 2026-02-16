import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { services } from "./services";
import { inventoryItems } from "./inventory";

export const serviceInventoryRequirements = pgTable("service_inventory_requirements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  inventoryItemId: text("inventory_item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  quantityRequired: integer("quantity_required").notNull().default(1),
});

export type ServiceInventoryRequirementRecord = typeof serviceInventoryRequirements.$inferSelect;
export type NewServiceInventoryRequirement = typeof serviceInventoryRequirements.$inferInsert;
