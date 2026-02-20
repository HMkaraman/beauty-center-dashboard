import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { appointments } from "./appointments";
import { services } from "./services";
import { clients } from "./clients";
import { inventoryItems } from "./inventory";

export const consumptionTypeEnum = pgEnum("consumption_type", [
  "laser_shots",
  "injectable",
]);

export const shotDeviationEnum = pgEnum("shot_deviation", [
  "within_range",
  "below",
  "above",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "active",
  "used",
  "expired",
  "disposed",
]);

export const sessionConsumptionLogs = pgTable("session_consumption_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  appointmentId: text("appointment_id").notNull().references(() => appointments.id, { onDelete: "cascade" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  consumptionType: consumptionTypeEnum("consumption_type").notNull(),
  // Laser fields
  actualShots: integer("actual_shots"),
  expectedMinShots: integer("expected_min_shots"),
  expectedMaxShots: integer("expected_max_shots"),
  shotDeviation: shotDeviationEnum("shot_deviation"),
  // Injectable fields
  inventoryItemId: text("inventory_item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }),
  totalAllocated: numeric("total_allocated", { precision: 10, scale: 2 }),
  amountUsed: numeric("amount_used", { precision: 10, scale: 2 }),
  leftoverAmount: numeric("leftover_amount", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 10 }),
  // Device fields (future integration)
  deviceId: varchar("device_id", { length: 100 }),
  deviceModel: varchar("device_model", { length: 100 }),
  notes: text("notes"),
  recordedById: text("recorded_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientProductReservations = pgTable("client_product_reservations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  consumptionLogId: text("consumption_log_id").notNull().references(() => sessionConsumptionLogs.id, { onDelete: "cascade" }),
  inventoryItemId: text("inventory_item_id").references(() => inventoryItems.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  leftoverAmount: numeric("leftover_amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: numeric("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 10 }).notNull(),
  originalAppointmentId: text("original_appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  openedDate: varchar("opened_date", { length: 10 }),
  expiryDate: varchar("expiry_date", { length: 10 }),
  expiryDays: integer("expiry_days"),
  status: reservationStatusEnum("status").notNull().default("active"),
  touchUpAppointmentId: text("touch_up_appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  touchUpDate: varchar("touch_up_date", { length: 10 }),
  touchUpAmountUsed: numeric("touch_up_amount_used", { precision: 10, scale: 2 }),
  touchUpIsFree: integer("touch_up_is_free").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SessionConsumptionLogRecord = typeof sessionConsumptionLogs.$inferSelect;
export type NewSessionConsumptionLog = typeof sessionConsumptionLogs.$inferInsert;
export type ClientProductReservationRecord = typeof clientProductReservations.$inferSelect;
export type NewClientProductReservation = typeof clientProductReservations.$inferInsert;
