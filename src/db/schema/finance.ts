import { integer, numeric, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
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
  accountId: text("account_id"),
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
  categoryId: text("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment tracking against invoices
export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDate: varchar("payment_date", { length: 10 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Simplified chart of accounts for P&L categorization
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: varchar("type", { length: 20 }).notNull(),
  parentCode: varchar("parent_code", { length: 20 }),
  isSystem: integer("is_system").default(0),
  isActive: integer("is_active").default(1),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recurring expenses for auto-generation
export const recurringExpenses = pgTable("recurring_expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 500 }).notNull(),
  categoryId: text("category_id"),
  category: varchar("category", { length: 100 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  dayOfMonth: integer("day_of_month").default(1),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }),
  autoApprove: integer("auto_approve").default(0),
  lastGeneratedDate: varchar("last_generated_date", { length: 10 }),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily cash settlements
export const dailySettlements = pgTable("daily_settlements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(),
  openingBalance: numeric("opening_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  cashSales: numeric("cash_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  cardSales: numeric("card_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  bankTransferSales: numeric("bank_transfer_sales", { precision: 10, scale: 2 }).notNull().default("0"),
  cashExpenses: numeric("cash_expenses", { precision: 10, scale: 2 }).notNull().default("0"),
  expectedCash: numeric("expected_cash", { precision: 10, scale: 2 }).notNull().default("0"),
  actualCash: numeric("actual_cash", { precision: 10, scale: 2 }),
  discrepancy: numeric("discrepancy", { precision: 10, scale: 2 }),
  closedBy: text("closed_by").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Financial period closing
export const financialPeriods = pgTable("financial_periods", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  snapshotRevenue: numeric("snapshot_revenue", { precision: 12, scale: 2 }),
  snapshotExpenses: numeric("snapshot_expenses", { precision: 12, scale: 2 }),
  snapshotProfit: numeric("snapshot_profit", { precision: 12, scale: 2 }),
  closedBy: text("closed_by").references(() => users.id, { onDelete: "set null" }),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TransactionRecord = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type ExpenseRecord = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type PaymentRecord = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type AccountRecord = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type RecurringExpenseRecord = typeof recurringExpenses.$inferSelect;
export type NewRecurringExpense = typeof recurringExpenses.$inferInsert;
export type DailySettlementRecord = typeof dailySettlements.$inferSelect;
export type NewDailySettlement = typeof dailySettlements.$inferInsert;
export type FinancialPeriodRecord = typeof financialPeriods.$inferSelect;
export type NewFinancialPeriod = typeof financialPeriods.$inferInsert;
