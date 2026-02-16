import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { invoices } from "./invoices";

export const doctorStatusEnum = pgEnum("doctor_status", [
  "active",
  "on-leave",
  "inactive",
]);

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  status: doctorStatusEnum("status").notNull().default("active"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  licenseNumber: varchar("license_number", { length: 100 }),
  bio: text("bio"),
  education: text("education"),
  certificates: text("certificates"),
  yearsOfExperience: integer("years_of_experience"),
  compensationType: varchar("compensation_type", { length: 20 }),
  salary: numeric("salary", { precision: 10, scale: 2 }),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const doctorCommissions = pgTable("doctor_commissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DoctorRecord = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type DoctorCommissionRecord = typeof doctorCommissions.$inferSelect;
export type NewDoctorCommission = typeof doctorCommissions.$inferInsert;
