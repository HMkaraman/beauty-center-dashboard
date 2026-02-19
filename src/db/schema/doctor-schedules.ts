import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { doctors } from "./doctors";

export const doctorSchedules = pgTable("doctor_schedules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Saturday...6=Friday
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
  isAvailable: integer("is_available").default(1).notNull(),
});

export type DoctorScheduleRecord = typeof doctorSchedules.$inferSelect;
export type NewDoctorSchedule = typeof doctorSchedules.$inferInsert;
