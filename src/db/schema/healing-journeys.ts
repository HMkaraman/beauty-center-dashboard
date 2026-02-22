import { integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { clients } from "./clients";
import { services } from "./services";
import { appointments } from "./appointments";
import { invoices } from "./invoices";
import { doctors } from "./doctors";
import { employees } from "./employees";

export const healingJourneyStatusEnum = pgEnum("healing_journey_status", [
  "active",
  "completed",
  "paused",
]);

export const consentStatusEnum = pgEnum("consent_status", [
  "pending",
  "approved",
  "rejected",
]);

export const journeyEntryTypeEnum = pgEnum("journey_entry_type", [
  "session",
  "prescription",
  "note",
  "photo",
  "milestone",
]);

export const attachmentLabelEnum = pgEnum("attachment_label", [
  "before",
  "after",
  "during",
  "prescription_scan",
  "general",
]);

export const healingJourneys = pgTable("healing_journeys", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: healingJourneyStatusEnum("status").notNull().default("active"),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }),
  primaryServiceId: text("primary_service_id").references(() => services.id, { onDelete: "set null" }),
  createdById: text("created_by_id"),
  consentStatus: consentStatusEnum("consent_status"),
  signatureUrl: text("signature_url"),
  consentSignedAt: timestamp("consent_signed_at"),
  consentRequestedAt: timestamp("consent_requested_at"),
  consentRequestedById: text("consent_requested_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healingJourneyEntries = pgTable("healing_journey_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  journeyId: text("journey_id").notNull().references(() => healingJourneys.id, { onDelete: "cascade" }),
  type: journeyEntryTypeEnum("type").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  notes: text("notes"),
  createdById: text("created_by_id"),
  // session fields
  appointmentId: text("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceName: varchar("service_name", { length: 255 }),
  doctorId: text("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  doctorName: varchar("doctor_name", { length: 255 }),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "set null" }),
  employeeName: varchar("employee_name", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }),
  duration: integer("duration"),
  invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  // prescription fields
  prescriptionText: text("prescription_text"),
  prescribedByDoctorId: text("prescribed_by_doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  prescribedByDoctorName: varchar("prescribed_by_doctor_name", { length: 255 }),
  // milestone fields
  milestoneLabel: varchar("milestone_label", { length: 255 }),
  // extensibility
  metadata: jsonb("metadata"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const healingJourneyAttachments = pgTable("healing_journey_attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  entryId: text("entry_id").notNull().references(() => healingJourneyEntries.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  filename: varchar("filename", { length: 500 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  label: attachmentLabelEnum("label").default("general"),
  bodyRegion: varchar("body_region", { length: 100 }),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HealingJourneyRecord = typeof healingJourneys.$inferSelect;
export type NewHealingJourney = typeof healingJourneys.$inferInsert;
export type HealingJourneyEntryRecord = typeof healingJourneyEntries.$inferSelect;
export type NewHealingJourneyEntry = typeof healingJourneyEntries.$inferInsert;
export type HealingJourneyAttachmentRecord = typeof healingJourneyAttachments.$inferSelect;
export type NewHealingJourneyAttachment = typeof healingJourneyAttachments.$inferInsert;
