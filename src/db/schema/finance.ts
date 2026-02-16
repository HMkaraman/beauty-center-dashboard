import { numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { invoices } from "./invoices";
import { users } from "./users";

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const expenseStatusEnum = pgEnum("expense_status", ["approved", "pending", "rejected"]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  expenseId: text("expense_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: expenseStatusEnum("status").notNull().default("pending"),
  approvedBy: text("approved_by").references(() => users.id, { onDelete: "set null" }),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TransactionRecord = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type ExpenseRecord = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
