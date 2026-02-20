import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import {
  appointments,
  workingHours,
  employees,
  employeeSchedules,
  doctors,
  doctorSchedules,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Get day of week: 0=Saturday...6=Friday (matching the app's convention)
function getDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const jsDay = d.getDay();
  return jsDay === 6 ? 0 : jsDay + 1;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface ProviderInfo {
  id: string;
  name: string;
  type: "employee" | "doctor";
  image: string | null;
  role: string;
}

interface ApptInfo {
  id: string;
  time: string;
  duration: number;
  clientName: string;
  service: string;
  status: string;
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = getDayOfWeek(today);
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const nowMins = timeToMinutes(nowStr);

    // Run all queries in parallel
    const [
      centerHours,
      activeEmployees,
      activeDoctors,
      empSchedules,
      docSchedules,
      todayAppts,
    ] = await Promise.all([
      // 1. Center working hours for today
      db
        .select()
        .from(workingHours)
        .where(
          and(
            eq(workingHours.tenantId, tenantId),
            eq(workingHours.dayOfWeek, dayOfWeek)
          )
        )
        .limit(1),
      // 2. Active employees
      db
        .select({
          id: employees.id,
          name: employees.name,
          image: employees.image,
          role: employees.role,
        })
        .from(employees)
        .where(
          and(
            eq(employees.tenantId, tenantId),
            eq(employees.status, "active")
          )
        ),
      // 3. Active doctors
      db
        .select({
          id: doctors.id,
          name: doctors.name,
          image: doctors.image,
          specialty: doctors.specialty,
        })
        .from(doctors)
        .where(
          and(
            eq(doctors.tenantId, tenantId),
            eq(doctors.status, "active")
          )
        ),
      // 4. Employee schedules for today
      db
        .select()
        .from(employeeSchedules)
        .where(
          and(
            eq(employeeSchedules.tenantId, tenantId),
            eq(employeeSchedules.dayOfWeek, dayOfWeek)
          )
        ),
      // 5. Doctor schedules for today
      db
        .select()
        .from(doctorSchedules)
        .where(
          and(
            eq(doctorSchedules.tenantId, tenantId),
            eq(doctorSchedules.dayOfWeek, dayOfWeek)
          )
        ),
      // 6. All non-cancelled appointments for today
      db
        .select({
          id: appointments.id,
          time: appointments.time,
          duration: appointments.duration,
          clientName: appointments.clientName,
          service: appointments.service,
          status: appointments.status,
          employeeId: appointments.employeeId,
          doctorId: appointments.doctorId,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            eq(appointments.date, today),
            sql`${appointments.status} NOT IN ('cancelled', 'no-show')`
          )
        )
        .orderBy(appointments.time),
    ]);

    const wh = centerHours[0];
    const centerClosed = !wh || !wh.isOpen;

    // Index schedules by provider ID for fast lookup
    const empScheduleMap = new Map(
      empSchedules.map((s) => [s.employeeId, s])
    );
    const docScheduleMap = new Map(
      docSchedules.map((s) => [s.doctorId, s])
    );

    // Group appointments by provider
    const apptsByEmployee = new Map<string, ApptInfo[]>();
    const apptsByDoctor = new Map<string, ApptInfo[]>();

    for (const appt of todayAppts) {
      const info: ApptInfo = {
        id: appt.id,
        time: appt.time,
        duration: appt.duration,
        clientName: appt.clientName,
        service: appt.service,
        status: appt.status,
      };
      if (appt.employeeId) {
        const list = apptsByEmployee.get(appt.employeeId) ?? [];
        list.push(info);
        apptsByEmployee.set(appt.employeeId, list);
      }
      if (appt.doctorId) {
        const list = apptsByDoctor.get(appt.doctorId) ?? [];
        list.push(info);
        apptsByDoctor.set(appt.doctorId, list);
      }
    }

    function computeProvider(
      provider: ProviderInfo,
      schedule: { startTime: string; endTime: string; isAvailable: number | null } | undefined,
      providerAppts: ApptInfo[]
    ) {
      // If center is closed or provider has no schedule / is unavailable
      const notWorking =
        centerClosed ||
        (schedule != null && !schedule.isAvailable);

      const workStart = schedule?.startTime ?? wh?.startTime ?? "09:00";
      const workEnd = schedule?.endTime ?? wh?.endTime ?? "17:00";

      if (notWorking) {
        return {
          ...provider,
          notWorking: true,
          workingHours: null,
          currentStatus: "off" as const,
          currentAppointment: null,
          nextAvailableTime: null,
          appointmentCount: 0,
          appointments: [],
        };
      }

      // Find current appointment (overlapping now)
      let currentAppointment: {
        clientName: string;
        service: string;
        time: string;
        duration: number;
      } | null = null;
      let currentStatus: "free" | "busy" | "off" = "free";

      // Check if outside working hours
      const workStartMins = timeToMinutes(workStart);
      const workEndMins = timeToMinutes(workEnd);

      if (nowMins < workStartMins || nowMins >= workEndMins) {
        currentStatus = "off";
      } else {
        for (const appt of providerAppts) {
          const apptStart = timeToMinutes(appt.time);
          const apptEnd = apptStart + appt.duration;
          if (
            nowMins >= apptStart &&
            nowMins < apptEnd &&
            (appt.status === "in-progress" || appt.status === "waiting" || appt.status === "confirmed")
          ) {
            currentStatus = "busy";
            currentAppointment = {
              clientName: appt.clientName,
              service: appt.service,
              time: appt.time,
              duration: appt.duration,
            };
            break;
          }
        }
      }

      // Compute next available time
      let nextAvailableTime: string | null = null;

      if (currentStatus === "busy" || currentStatus === "off") {
        // Build sorted list of busy intervals
        const intervals = providerAppts
          .filter((a) => a.status !== "completed")
          .map((a) => ({
            start: timeToMinutes(a.time),
            end: timeToMinutes(a.time) + a.duration,
          }))
          .sort((a, b) => a.start - b.start);

        // Find the earliest gap after now that's within working hours
        let searchFrom = Math.max(nowMins, workStartMins);

        for (const interval of intervals) {
          if (interval.start > searchFrom) {
            // There's a gap before this interval
            nextAvailableTime = minutesToTime(searchFrom);
            break;
          }
          if (interval.end > searchFrom) {
            searchFrom = interval.end;
          }
        }

        if (!nextAvailableTime && searchFrom < workEndMins) {
          nextAvailableTime = minutesToTime(searchFrom);
        }
      }

      return {
        ...provider,
        notWorking: false,
        workingHours: { start: workStart, end: workEnd },
        currentStatus,
        currentAppointment,
        nextAvailableTime,
        appointmentCount: providerAppts.length,
        appointments: providerAppts,
      };
    }

    const providers = [
      ...activeEmployees.map((emp) => {
        const provider: ProviderInfo = {
          id: emp.id,
          name: emp.name,
          type: "employee",
          image: emp.image,
          role: emp.role,
        };
        return computeProvider(
          provider,
          empScheduleMap.get(emp.id),
          apptsByEmployee.get(emp.id) ?? []
        );
      }),
      ...activeDoctors.map((doc) => {
        const provider: ProviderInfo = {
          id: doc.id,
          name: doc.name,
          type: "doctor",
          image: doc.image,
          role: doc.specialty,
        };
        return computeProvider(
          provider,
          docScheduleMap.get(doc.id),
          apptsByDoctor.get(doc.id) ?? []
        );
      }),
    ];

    return success({ providers });
  } catch (error) {
    console.error("GET /api/reception/today-availability error:", error);
    return serverError();
  }
}
