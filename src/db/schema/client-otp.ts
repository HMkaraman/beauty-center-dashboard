import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const clientOtpCodes = pgTable("client_otp_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  tenantId: text("tenant_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ClientOtpCode = typeof clientOtpCodes.$inferSelect;
export type NewClientOtpCode = typeof clientOtpCodes.$inferInsert;
