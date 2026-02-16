import { NextRequest } from "next/server";
import { success, serverError } from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments, tenantSettings, tenants, notifications, clients } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";
import { appointmentReminder } from "@/lib/notifications/templates";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find all appointments for tomorrow that are confirmed or pending
    const tomorrowAppointments = await db
      .select({
        appointment: appointments,
        settings: tenantSettings,
        tenant: tenants,
      })
      .from(appointments)
      .innerJoin(tenants, eq(appointments.tenantId, tenants.id))
      .leftJoin(tenantSettings, eq(appointments.tenantId, tenantSettings.tenantId))
      .where(
        and(
          eq(appointments.date, tomorrowStr),
          sql`${appointments.status} IN ('confirmed', 'pending')`
        )
      );

    let smsSent = 0;
    let emailSent = 0;
    let smsFailed = 0;
    let emailFailed = 0;

    for (const row of tomorrowAppointments) {
      const { appointment, settings, tenant } = row;
      const businessName = settings?.businessName || tenant.name;

      const template = appointmentReminder({
        clientName: appointment.clientName,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        businessName,
      });

      // Send SMS if enabled and phone is available
      if (settings?.smsEnabled && appointment.clientPhone) {
        const [smsNotification] = await db
          .insert(notifications)
          .values({
            tenantId: appointment.tenantId,
            type: "appointment_reminder",
            channel: "sms",
            recipient: appointment.clientPhone,
            body: template.sms,
            status: "pending",
          })
          .returning();

        const sent = await sendNotification({
          to: appointment.clientPhone,
          body: template.sms,
          type: "sms",
        });

        await db
          .update(notifications)
          .set({
            status: sent ? "sent" : "failed",
            sentAt: sent ? new Date() : null,
          })
          .where(eq(notifications.id, smsNotification.id));

        if (sent) smsSent++;
        else smsFailed++;
      }

      // Send email if enabled and client has email
      if (settings?.emailEnabled && appointment.clientId) {
        const [client] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, appointment.clientId))
          .limit(1);

        if (client?.email) {
          const [emailNotification] = await db
            .insert(notifications)
            .values({
              tenantId: appointment.tenantId,
              type: "appointment_reminder",
              channel: "email",
              recipient: client.email,
              subject: template.email.subject,
              body: template.email.html,
              status: "pending",
            })
            .returning();

          const sent = await sendNotification({
            to: client.email,
            subject: template.email.subject,
            body: template.email.html,
            type: "email",
          });

          await db
            .update(notifications)
            .set({
              status: sent ? "sent" : "failed",
              sentAt: sent ? new Date() : null,
            })
            .where(eq(notifications.id, emailNotification.id));

          if (sent) emailSent++;
          else emailFailed++;
        }
      }
    }

    return success({
      message: "Reminder cron completed",
      date: tomorrowStr,
      appointmentsFound: tomorrowAppointments.length,
      results: {
        smsSent,
        smsFailed,
        emailSent,
        emailFailed,
      },
    });
  } catch (error) {
    console.error("GET /api/cron/reminders error:", error);
    return serverError();
  }
}
