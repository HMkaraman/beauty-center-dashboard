import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { clients } from "./clients";
import { appointments } from "./appointments";

export const invoiceStatusEnum = pgEnum("invoice_status", ["paid", "unpaid", "void", "partially_paid"]);
export const invoicePaymentMethodEnum = pgEnum("invoice_payment_method", [
  "cash",
  "card",
  "bank_transfer",
]);

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  clientId: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 20 }),
  appointmentId: text("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("15"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("unpaid"),
  paymentMethod: invoicePaymentMethodEnum("payment_method"),
  notes: text("notes"),
  // GCC/MENA e-invoicing fields
  uuid: text("uuid").$defaultFn(() => crypto.randomUUID()),
  invoiceType: varchar("invoice_type", { length: 20 }).default("standard"),
  invoiceTypeCode: varchar("invoice_type_code", { length: 5 }),
  originalInvoiceId: text("original_invoice_id"),
  buyerTrn: varchar("buyer_trn", { length: 50 }),
  buyerName: varchar("buyer_name", { length: 255 }),
  buyerAddress: text("buyer_address"),
  qrCode: text("qr_code"),
  xmlContent: text("xml_content"),
  digitalSignature: text("digital_signature"),
  zatcaStatus: varchar("zatca_status", { length: 20 }),
  zatcaResponse: text("zatca_response"),
  issuedAt: timestamp("issued_at"),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  discountTotal: numeric("discount_total", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  // Per-item tax and service linking
  serviceId: text("service_id"),
  taxCategory: varchar("tax_category", { length: 20 }).default("S"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("15"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
});

export type InvoiceRecord = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItemRecord = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
