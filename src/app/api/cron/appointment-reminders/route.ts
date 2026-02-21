import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments } from "@/db/schema";
import { and, sql } from "drizzle-orm";
import { triggerNotification } from "@/lib/notification-events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate the time window: 55-65 minutes from now
    const now = new Date();
    const windowStart = new Date(now.getTime() + 55 * 60_000);
    const windowEnd = new Date(now.getTime() + 65 * 60_000);

    const targetDate = windowStart.toISOString().split("T")[0];
    const startTime = windowStart.toTimeString().slice(0, 5); // HH:MM
    const endTime = windowEnd.toTimeString().slice(0, 5);

    // Find appointments starting ~1 hour from now
    const upcomingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          sql`${appointments.date} = ${targetDate}`,
          sql`${appointments.time} >= ${startTime}`,
          sql`${appointments.time} <= ${endTime}`,
          sql`${appointments.status} IN ('confirmed', 'pending')`
        )
      );

    let notified = 0;

    for (const appointment of upcomingAppointments) {
      try {
        triggerNotification({
          eventKey: "appointment_reminder",
          tenantId: appointment.tenantId,
          actorId: "system",
          actorName: "System",
          entityType: "appointment",
          entityId: appointment.id,
          context: {
            clientName: appointment.clientName,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            reminderLabel: "In 1 hour / بعد ساعة",
          },
          targetUserIds: appointment.employeeId ? [appointment.employeeId] : undefined,
        });
        notified++;
      } catch (e) {
        console.error("In-app 1hr reminder error:", e);
      }
    }

    return success({
      message: "Hourly reminder cron completed",
      appointmentsFound: upcomingAppointments.length,
      notified,
    });
  } catch (error) {
    console.error("GET /api/cron/appointment-reminders error:", error);
    return serverError();
  }
}
