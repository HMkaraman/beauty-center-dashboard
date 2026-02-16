import { db } from "@/db/db";
import {
  appointments,
  workingHours,
  employees,
  employeeSchedules,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Convert "HH:MM" to minutes since midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Convert minutes to "HH:MM"
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface TimeSlot {
  time: string; // "HH:MM"
  employeeId: string;
  employeeName: string;
}

// Get day of week from date string "YYYY-MM-DD"
// Returns 0=Saturday...6=Friday (matching the app's convention in working_hours)
function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  // JS: 0=Sun, 1=Mon... 6=Sat
  // App: 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  const jsDay = d.getDay();
  return jsDay === 6 ? 0 : jsDay + 1;
}

/**
 * Get available time slots for a specific service on a given date.
 *
 * Algorithm:
 * 1. Check if the date's day of week is open (working_hours)
 * 2. Get all active employees (optionally filtered by specific employee)
 * 3. For each employee, get their schedule for this day (or fall back to working hours)
 * 4. Get existing booked appointments for each employee on this date
 * 5. Generate 15-min interval slots that fit the service duration without overlap
 * 6. Return all available slots sorted by time
 */
export async function getAvailableSlots(params: {
  tenantId: string;
  date: string; // "YYYY-MM-DD"
  serviceDuration: number; // minutes
  employeeId?: string; // optional: filter to specific employee
  slotInterval?: number; // default 15 minutes
}): Promise<TimeSlot[]> {
  const {
    tenantId,
    date,
    serviceDuration,
    employeeId,
    slotInterval = 15,
  } = params;
  const dayOfWeek = getDayOfWeek(date);

  // 1. Check working hours for this day
  const [wh] = await db
    .select()
    .from(workingHours)
    .where(
      and(
        eq(workingHours.tenantId, tenantId),
        eq(workingHours.dayOfWeek, dayOfWeek)
      )
    )
    .limit(1);

  if (!wh || !wh.isOpen) return []; // Center is closed

  const workStart = timeToMinutes(wh.startTime);
  const workEnd = timeToMinutes(wh.endTime);

  // 2. Get active employees
  const employeeConditions = [
    eq(employees.tenantId, tenantId),
    eq(employees.status, "active"),
  ];
  if (employeeId) {
    employeeConditions.push(eq(employees.id, employeeId));
  }

  const activeEmployees = await db
    .select({ id: employees.id, name: employees.name })
    .from(employees)
    .where(and(...employeeConditions));

  if (activeEmployees.length === 0) return [];

  // 3. Get employee schedules for this day (if they exist)
  const empSchedules = await db
    .select()
    .from(employeeSchedules)
    .where(
      and(
        eq(employeeSchedules.tenantId, tenantId),
        eq(employeeSchedules.dayOfWeek, dayOfWeek)
      )
    );

  const scheduleMap = new Map<
    string,
    { start: number; end: number; available: boolean }
  >();
  for (const es of empSchedules) {
    scheduleMap.set(es.employeeId, {
      start: timeToMinutes(es.startTime),
      end: timeToMinutes(es.endTime),
      available: !!es.isAvailable,
    });
  }

  // 4. Get existing appointments for this date
  const existingAppts = await db
    .select({
      employeeId: appointments.employeeId,
      time: appointments.time,
      duration: appointments.duration,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        eq(appointments.date, date),
        sql`${appointments.status} NOT IN ('cancelled', 'no-show')`
      )
    );

  // Group appointments by employee
  const apptsByEmployee = new Map<
    string,
    Array<{ start: number; end: number }>
  >();
  for (const appt of existingAppts) {
    if (!appt.employeeId) continue;
    const existing = apptsByEmployee.get(appt.employeeId) || [];
    const start = timeToMinutes(appt.time);
    existing.push({ start, end: start + appt.duration });
    apptsByEmployee.set(appt.employeeId, existing);
  }

  // 5. Generate slots for each employee
  const slots: TimeSlot[] = [];

  for (const emp of activeEmployees) {
    // Check employee-specific schedule
    const empSchedule = scheduleMap.get(emp.id);
    if (empSchedule && !empSchedule.available) continue; // Employee not available this day

    const empStart = empSchedule
      ? Math.max(empSchedule.start, workStart)
      : workStart;
    const empEnd = empSchedule
      ? Math.min(empSchedule.end, workEnd)
      : workEnd;

    const empAppts = (apptsByEmployee.get(emp.id) || []).sort(
      (a, b) => a.start - b.start
    );

    // Generate slots at slotInterval intervals
    for (
      let cursor = empStart;
      cursor + serviceDuration <= empEnd;
      cursor += slotInterval
    ) {
      const slotEnd = cursor + serviceDuration;

      // Check for overlap with any existing appointment
      const hasOverlap = empAppts.some(
        (appt) => cursor < appt.end && slotEnd > appt.start
      );

      if (!hasOverlap) {
        slots.push({
          time: minutesToTime(cursor),
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }
    }
  }

  // 6. Sort by time, then by employee name
  slots.sort((a, b) => {
    const timeDiff = timeToMinutes(a.time) - timeToMinutes(b.time);
    return timeDiff !== 0
      ? timeDiff
      : a.employeeName.localeCompare(b.employeeName);
  });

  return slots;
}

/**
 * Get available dates for the next N days (checking if center is open and has any slots).
 * Returns array of "YYYY-MM-DD" strings.
 */
export async function getAvailableDates(params: {
  tenantId: string;
  serviceDuration: number;
  days?: number; // default 30
}): Promise<string[]> {
  const { tenantId, serviceDuration, days = 30 } = params;

  // Get all working hours for this tenant
  const whs = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.tenantId, tenantId));

  const openDays = new Set(
    whs.filter((wh) => !!wh.isOpen).map((wh) => wh.dayOfWeek)
  );

  const availableDates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = getDayOfWeek(dateStr);

    if (openDays.has(dayOfWeek)) {
      availableDates.push(dateStr);
    }
  }

  return availableDates;
}
