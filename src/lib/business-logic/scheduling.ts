import { db } from "@/db/db";
import { appointments, doctorSchedules } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";

// Convert "HH:MM" time string to minutes since midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Convert minutes since midnight to "HH:MM"
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Get day of week from date string "YYYY-MM-DD"
// Returns 0=Saturday...6=Friday (matching the app's convention)
function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const jsDay = d.getDay();
  return jsDay === 6 ? 0 : jsDay + 1;
}

// Check if new appointment overlaps with existing ones for same employee and/or doctor
export async function checkConflict(params: {
  tenantId: string;
  employeeId?: string | null;
  employee?: string;
  doctorId?: string | null;
  date: string;
  time: string;
  duration: number;
  excludeId?: string; // for edits
}): Promise<{
  hasConflict: boolean;
  conflictType?: "employee" | "doctor";
  conflictingAppointment?: {
    time: string;
    duration: number;
    clientName: string;
    service: string;
  };
}> {
  const newStart = timeToMinutes(params.time);
  const newEnd = newStart + params.duration;

  // 1. Employee conflict check
  if (params.employeeId || params.employee) {
    const conditions = [
      eq(appointments.tenantId, params.tenantId),
      eq(appointments.date, params.date),
      sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
    ];

    if (params.employeeId) {
      conditions.push(eq(appointments.employeeId, params.employeeId));
    } else if (params.employee) {
      conditions.push(eq(appointments.employee, params.employee));
    }

    if (params.excludeId) {
      conditions.push(ne(appointments.id, params.excludeId));
    }

    const existing = await db
      .select({
        time: appointments.time,
        duration: appointments.duration,
        clientName: appointments.clientName,
        service: appointments.service,
      })
      .from(appointments)
      .where(and(...conditions));

    for (const appt of existing) {
      const existStart = timeToMinutes(appt.time);
      const existEnd = existStart + appt.duration;

      if (newStart < existEnd && newEnd > existStart) {
        return {
          hasConflict: true,
          conflictType: "employee",
          conflictingAppointment: appt,
        };
      }
    }
  }

  // 2. Doctor conflict check
  if (params.doctorId) {
    const conditions = [
      eq(appointments.tenantId, params.tenantId),
      eq(appointments.date, params.date),
      eq(appointments.doctorId, params.doctorId),
      sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
    ];

    if (params.excludeId) {
      conditions.push(ne(appointments.id, params.excludeId));
    }

    const existing = await db
      .select({
        time: appointments.time,
        duration: appointments.duration,
        clientName: appointments.clientName,
        service: appointments.service,
      })
      .from(appointments)
      .where(and(...conditions));

    for (const appt of existing) {
      const existStart = timeToMinutes(appt.time);
      const existEnd = existStart + appt.duration;

      if (newStart < existEnd && newEnd > existStart) {
        return {
          hasConflict: true,
          conflictType: "doctor",
          conflictingAppointment: appt,
        };
      }
    }
  }

  return { hasConflict: false };
}

// Find next available slot for an employee on a date
export async function findNextAvailableSlot(params: {
  tenantId: string;
  employeeId?: string | null;
  employee?: string;
  doctorId?: string | null;
  date: string;
  duration: number;
  workStart?: string; // default "09:00"
  workEnd?: string; // default "21:00"
}): Promise<string | null> {
  const workStartMins = timeToMinutes(params.workStart || "09:00");
  const workEndMins = timeToMinutes(params.workEnd || "21:00");

  // Collect all booked slots from both employee and doctor
  const allSlots: Array<{ start: number; end: number }> = [];

  // Employee appointments
  if (params.employeeId || params.employee) {
    const conditions = [
      eq(appointments.tenantId, params.tenantId),
      eq(appointments.date, params.date),
      sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
    ];

    if (params.employeeId) {
      conditions.push(eq(appointments.employeeId, params.employeeId));
    } else if (params.employee) {
      conditions.push(eq(appointments.employee, params.employee));
    }

    const existing = await db
      .select({
        time: appointments.time,
        duration: appointments.duration,
      })
      .from(appointments)
      .where(and(...conditions));

    for (const a of existing) {
      const start = timeToMinutes(a.time);
      allSlots.push({ start, end: start + a.duration });
    }
  }

  // Doctor appointments
  if (params.doctorId) {
    const conditions = [
      eq(appointments.tenantId, params.tenantId),
      eq(appointments.date, params.date),
      eq(appointments.doctorId, params.doctorId),
      sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
    ];

    const existing = await db
      .select({
        time: appointments.time,
        duration: appointments.duration,
      })
      .from(appointments)
      .where(and(...conditions));

    for (const a of existing) {
      const start = timeToMinutes(a.time);
      allSlots.push({ start, end: start + a.duration });
    }
  }

  // Sort and find gaps
  const sorted = allSlots.sort((a, b) => a.start - b.start);

  let cursor = workStartMins;
  for (const slot of sorted) {
    if (cursor + params.duration <= slot.start) {
      return minutesToTime(cursor);
    }
    cursor = Math.max(cursor, slot.end);
  }

  if (cursor + params.duration <= workEndMins) {
    return minutesToTime(cursor);
  }

  return null;
}

// Check if appointment time is within doctor's working hours
export async function checkDoctorWorkingHours(params: {
  tenantId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
}): Promise<{
  withinSchedule: boolean;
  schedule?: { startTime: string; endTime: string };
}> {
  const dayOfWeek = getDayOfWeek(params.date);

  const [schedule] = await db
    .select()
    .from(doctorSchedules)
    .where(
      and(
        eq(doctorSchedules.tenantId, params.tenantId),
        eq(doctorSchedules.doctorId, params.doctorId),
        eq(doctorSchedules.dayOfWeek, dayOfWeek)
      )
    )
    .limit(1);

  // No schedule defined — don't block
  if (!schedule) {
    return { withinSchedule: true };
  }

  // Doctor not available this day
  if (!schedule.isAvailable) {
    return {
      withinSchedule: false,
      schedule: { startTime: schedule.startTime, endTime: schedule.endTime },
    };
  }

  const apptStart = timeToMinutes(params.time);
  const apptEnd = apptStart + params.duration;
  const schedStart = timeToMinutes(schedule.startTime);
  const schedEnd = timeToMinutes(schedule.endTime);

  const withinSchedule = apptStart >= schedStart && apptEnd <= schedEnd;

  return {
    withinSchedule,
    schedule: { startTime: schedule.startTime, endTime: schedule.endTime },
  };
}
