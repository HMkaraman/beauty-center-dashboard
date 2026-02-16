import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { clients } from "./clients";
import { services } from "./services";
import { employees } from "./employees";
import { doctors } from "./doctors";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "confirmed",
  "pending",
  "cancelled",
  "completed",
  "no-show",
]);

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 20 }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  service: varchar("service_name", { length: 255 }).notNull(),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "set null" }),
  employee: varchar("employee_name", { length: 255 }).notNull(),
  doctorId: text("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  date: varchar("date", { length: 10 }).notNull(),
  time: varchar("time", { length: 5 }).notNull(),
  duration: integer("duration").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AppointmentRecord = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
