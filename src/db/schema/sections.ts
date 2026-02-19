import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { employees } from "./employees";
import { doctors } from "./doctors";

export const sectionStatusEnum = pgEnum("section_status", ["active", "inactive"]);

export const sections = pgTable("sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  status: sectionStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employeeSections = pgTable("employee_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
});

export const doctorSections = pgTable("doctor_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
});

export type SectionRecord = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;
export type EmployeeSectionRecord = typeof employeeSections.$inferSelect;
export type DoctorSectionRecord = typeof doctorSections.$inferSelect;
