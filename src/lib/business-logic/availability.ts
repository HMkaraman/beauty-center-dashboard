import { db } from "@/db/db";
import {
  appointments,
  workingHours,
  employees,
  employeeSchedules,
  doctors,
  doctorSchedules,
} from "@/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";

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
  doctorId?: string;
  doctorName?: string;
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
 * 5. If doctorId is provided, get doctor's schedule and booked appointments
 * 6. Generate 15-min interval slots that fit the service duration without overlap
 *    - When both employee and doctor are selected, slot is available only if BOTH are free
 * 7. Return all available slots sorted by time
 */
export async function getAvailableSlots(params: {
  tenantId: string;
  date: string; // "YYYY-MM-DD"
  serviceDuration: number; // minutes
  employeeId?: string; // optional: filter to specific employee
  doctorId?: string; // optional: filter to specific doctor
  excludeAppointmentId?: string; // optional: exclude this appointment (for edit mode)
  slotInterval?: number; // default 15 minutes
}): Promise<TimeSlot[]> {
  const {
    tenantId,
    date,
    serviceDuration,
    employeeId,
    doctorId,
    excludeAppointmentId,
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

  // Build base conditions for existing appointments query
  const apptConditions = [
    eq(appointments.tenantId, tenantId),
    eq(appointments.date, date),
    sql`${appointments.status} NOT IN ('cancelled', 'no-show')`,
  ];
  if (excludeAppointmentId) {
    apptConditions.push(ne(appointments.id, excludeAppointmentId));
  }

  // ---- Doctor availability ----
  let doctorWindow: { start: number; end: number } | null = null;
  let doctorAppts: Array<{ start: number; end: number }> = [];
  let doctorInfo: { id: string; name: string } | null = null;

  if (doctorId) {
    // Get doctor info
    const [doc] = await db
      .select({ id: doctors.id, name: doctors.name })
      .from(doctors)
      .where(and(eq(doctors.id, doctorId), eq(doctors.tenantId, tenantId)))
      .limit(1);

    if (!doc) return []; // Doctor not found
    doctorInfo = doc;

    // Get doctor's schedule for this day
    const [docSchedule] = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.tenantId, tenantId),
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);

    if (docSchedule && !docSchedule.isAvailable) return []; // Doctor not available this day
    if (docSchedule) {
      doctorWindow = {
        start: Math.max(timeToMinutes(docSchedule.startTime), workStart),
        end: Math.min(timeToMinutes(docSchedule.endTime), workEnd),
      };
    }

    // Get doctor's existing appointments for this date
    const docAppts = await db
      .select({
        time: appointments.time,
        duration: appointments.duration,
      })
      .from(appointments)
      .where(and(...apptConditions, eq(appointments.doctorId, doctorId)));

    doctorAppts = docAppts.map((a) => {
      const start = timeToMinutes(a.time);
      return { start, end: start + a.duration };
    }).sort((a, b) => a.start - b.start);
  }

  // ---- Employee availability ----
  // If no employee is selected AND no doctor is selected, get all employees
  // If only doctor is selected (no employee), generate slots based on doctor only
  const needEmployees = !!employeeId || !doctorId;

  let activeEmployees: Array<{ id: string; name: string }> = [];
  const scheduleMap = new Map<string, { start: number; end: number; available: boolean }>();
  const apptsByEmployee = new Map<string, Array<{ start: number; end: number }>>();

  if (needEmployees) {
    // 2. Get active employees
    const employeeConditions = [
      eq(employees.tenantId, tenantId),
      eq(employees.status, "active"),
    ];
    if (employeeId) {
      employeeConditions.push(eq(employees.id, employeeId));
    }

    activeEmployees = await db
      .select({ id: employees.id, name: employees.name })
      .from(employees)
      .where(and(...employeeConditions));

    if (activeEmployees.length === 0 && !doctorId) return [];

    // 3. Get employee schedules for this day
    const empSchedules = await db
      .select()
      .from(employeeSchedules)
      .where(
        and(
          eq(employeeSchedules.tenantId, tenantId),
          eq(employeeSchedules.dayOfWeek, dayOfWeek)
        )
      );

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
      .where(and(...apptConditions));

    for (const appt of existingAppts) {
      if (!appt.employeeId) continue;
      const existing = apptsByEmployee.get(appt.employeeId) || [];
      const start = timeToMinutes(appt.time);
      existing.push({ start, end: start + appt.duration });
      apptsByEmployee.set(appt.employeeId, existing);
    }
  }

  // Helper: check doctor overlap
  const hasDoctorOverlap = (cursor: number, slotEnd: number): boolean => {
    return doctorAppts.some((appt) => cursor < appt.end && slotEnd > appt.start);
  };

  // 5. Generate slots
  const slots: TimeSlot[] = [];

  if (doctorId && !needEmployees) {
    // Doctor only (no employee selected, doctor IS selected)
    const effectiveStart = doctorWindow ? doctorWindow.start : workStart;
    const effectiveEnd = doctorWindow ? doctorWindow.end : workEnd;

    for (
      let cursor = effectiveStart;
      cursor + serviceDuration <= effectiveEnd;
      cursor += slotInterval
    ) {
      const slotEnd = cursor + serviceDuration;
      if (!hasDoctorOverlap(cursor, slotEnd)) {
        slots.push({
          time: minutesToTime(cursor),
          employeeId: "",
          employeeName: "",
          doctorId: doctorInfo!.id,
          doctorName: doctorInfo!.name,
        });
      }
    }
  } else {
    // Employee-based (with optional doctor constraint)
    for (const emp of activeEmployees) {
      const empSchedule = scheduleMap.get(emp.id);
      if (empSchedule && !empSchedule.available) continue;

      let empStart = empSchedule ? Math.max(empSchedule.start, workStart) : workStart;
      let empEnd = empSchedule ? Math.min(empSchedule.end, workEnd) : workEnd;

      // Intersect with doctor window if doctor is also selected
      if (doctorId && doctorWindow) {
        empStart = Math.max(empStart, doctorWindow.start);
        empEnd = Math.min(empEnd, doctorWindow.end);
      }

      if (empStart >= empEnd) continue; // No overlapping window

      const empAppts = (apptsByEmployee.get(emp.id) || []).sort(
        (a, b) => a.start - b.start
      );

      for (
        let cursor = empStart;
        cursor + serviceDuration <= empEnd;
        cursor += slotInterval
      ) {
        const slotEnd = cursor + serviceDuration;

        // Check employee overlap
        const hasEmpOverlap = empAppts.some(
          (appt) => cursor < appt.end && slotEnd > appt.start
        );

        // Check doctor overlap (if doctor selected)
        const hasDocOverlap = doctorId ? hasDoctorOverlap(cursor, slotEnd) : false;

        if (!hasEmpOverlap && !hasDocOverlap) {
          slots.push({
            time: minutesToTime(cursor),
            employeeId: emp.id,
            employeeName: emp.name,
            doctorId: doctorInfo?.id,
            doctorName: doctorInfo?.name,
          });
        }
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
 * Get available dates for the next N days.
 * Filters by center open days, employee schedule, and/or doctor schedule.
 * Returns array of "YYYY-MM-DD" strings where at least one slot is possible.
 */
export async function getAvailableDates(params: {
  tenantId: string;
  serviceDuration: number;
  employeeId?: string;
  doctorId?: string;
  excludeAppointmentId?: string;
  days?: number; // default 30
}): Promise<string[]> {
  const { tenantId, serviceDuration, employeeId, doctorId, days = 30 } = params;

  // Get all working hours for this tenant
  const whs = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.tenantId, tenantId));

  const openDays = new Set(
    whs.filter((wh) => !!wh.isOpen).map((wh) => wh.dayOfWeek)
  );

  // Get employee schedule days if employee is selected
  let empAvailableDays: Set<number> | null = null;
  if (employeeId) {
    const empSchedules = await db
      .select()
      .from(employeeSchedules)
      .where(
        and(
          eq(employeeSchedules.tenantId, tenantId),
          eq(employeeSchedules.employeeId, employeeId)
        )
      );
    if (empSchedules.length > 0) {
      empAvailableDays = new Set(
        empSchedules.filter((s) => !!s.isAvailable).map((s) => s.dayOfWeek)
      );
    }
  }

  // Get doctor schedule days if doctor is selected
  let docAvailableDays: Set<number> | null = null;
  if (doctorId) {
    const docSchedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.tenantId, tenantId),
          eq(doctorSchedules.doctorId, doctorId)
        )
      );
    if (docSchedules.length > 0) {
      docAvailableDays = new Set(
        docSchedules.filter((s) => !!s.isAvailable).map((s) => s.dayOfWeek)
      );
    }
  }

  const availableDates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = getDayOfWeek(dateStr);

    // Center must be open
    if (!openDays.has(dayOfWeek)) continue;

    // Employee must work this day (if selected and has schedule)
    if (empAvailableDays && !empAvailableDays.has(dayOfWeek)) continue;

    // Doctor must work this day (if selected and has schedule)
    if (docAvailableDays && !docAvailableDays.has(dayOfWeek)) continue;

    availableDates.push(dateStr);
  }

  return availableDates;
}
