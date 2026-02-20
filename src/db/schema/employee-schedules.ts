import { integer, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { employees } from "./employees";
import { invoices } from "./invoices";

export const employeeSchedules = pgTable("employee_schedules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Saturday, 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
  isAvailable: integer("is_available").default(1).notNull(),
});

export const employeeCommissions = pgTable("employee_commissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmployeeScheduleRecord = typeof employeeSchedules.$inferSelect;
export type NewEmployeeSchedule = typeof employeeSchedules.$inferInsert;
export type EmployeeCommissionRecord = typeof employeeCommissions.$inferSelect;
export type NewEmployeeCommission = typeof employeeCommissions.$inferInsert;
