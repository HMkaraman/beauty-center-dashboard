import { numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "on-leave",
  "inactive",
]);

export const employees = pgTable("employees", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 100 }).notNull(),
  specialties: text("specialties"),
  status: employeeStatusEnum("status").notNull().default("active"),
  hireDate: timestamp("hire_date").defaultNow().notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"),
  nationalId: varchar("national_id", { length: 50 }),
  passportNumber: varchar("passport_number", { length: 50 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  notes: text("notes"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type EmployeeRecord = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
