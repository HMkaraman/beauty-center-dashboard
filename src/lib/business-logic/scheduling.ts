import { db } from "@/db/db";
import { appointments } from "@/db/schema";
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

// Check if new appointment overlaps with existing ones for same employee
export async function checkConflict(params: {
  tenantId: string;
  employeeId?: string | null;
  employee: string;
  date: string;
  time: string;
  duration: number;
  excludeId?: string; // for edits
}): Promise<{
  hasConflict: boolean;
  conflictingAppointment?: {
    time: string;
    duration: number;
    clientName: string;
    service: string;
  };
}> {
  if (!params.employeeId && !params.employee) {
    return { hasConflict: false };
  }

  const conditions = [
    eq(appointments.tenantId, params.tenantId),
    eq(appointments.date, params.date),
    // Only check non-cancelled/non-completed for conflicts
    sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
  ];

  // Match by employee name since employeeId may not always be set
  if (params.employeeId) {
    conditions.push(eq(appointments.employeeId, params.employeeId));
  } else {
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

  const newStart = timeToMinutes(params.time);
  const newEnd = newStart + params.duration;

  for (const appt of existing) {
    const existStart = timeToMinutes(appt.time);
    const existEnd = existStart + appt.duration;

    // Overlap: new starts before existing ends AND new ends after existing starts
    if (newStart < existEnd && newEnd > existStart) {
      return {
        hasConflict: true,
        conflictingAppointment: appt,
      };
    }
  }

  return { hasConflict: false };
}

// Find next available slot for an employee on a date
export async function findNextAvailableSlot(params: {
  tenantId: string;
  employeeId?: string | null;
  employee: string;
  date: string;
  duration: number;
  workStart?: string; // default "09:00"
  workEnd?: string; // default "21:00"
}): Promise<string | null> {
  const workStartMins = timeToMinutes(params.workStart || "09:00");
  const workEndMins = timeToMinutes(params.workEnd || "21:00");

  const conditions = [
    eq(appointments.tenantId, params.tenantId),
    eq(appointments.date, params.date),
    sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
  ];

  if (params.employeeId) {
    conditions.push(eq(appointments.employeeId, params.employeeId));
  } else {
    conditions.push(eq(appointments.employee, params.employee));
  }

  const existing = await db
    .select({
      time: appointments.time,
      duration: appointments.duration,
    })
    .from(appointments)
    .where(and(...conditions));

  // Sort existing appointments by time
  const sorted = existing
    .map((a) => ({
      start: timeToMinutes(a.time),
      end: timeToMinutes(a.time) + a.duration,
    }))
    .sort((a, b) => a.start - b.start);

  // Try fitting in gaps
  let cursor = workStartMins;
  for (const slot of sorted) {
    if (cursor + params.duration <= slot.start) {
      return minutesToTime(cursor);
    }
    cursor = Math.max(cursor, slot.end);
  }

  // Check if there's room after the last appointment
  if (cursor + params.duration <= workEndMins) {
    return minutesToTime(cursor);
  }

  return null; // No available slot
}
