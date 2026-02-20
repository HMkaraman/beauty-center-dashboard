import { NextRequest } from "next/server";
import { success, serverError } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { notifications, tenantSettings, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";
import { productExpiryReminder } from "@/lib/notifications/templates";
import {
  expireReservations,
  getReservationsNearingExpiry,
} from "@/lib/business-logic/consumption-tracking";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 1: Expire past-due reservations
    const expired = await expireReservations();

    // Step 2: Send notifications for reservations expiring in 3 days
    const nearingExpiry = await getReservationsNearingExpiry(3);

    let smsSent = 0;
    let emailSent = 0;
    let smsFailed = 0;
    let emailFailed = 0;

    for (const row of nearingExpiry) {
      const { reservation, clientName, clientPhone } = row;

      // Get tenant settings
      const [settings] = await db
        .select()
        .from(tenantSettings)
        .where(eq(tenantSettings.tenantId, reservation.tenantId))
        .limit(1);

      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, reservation.tenantId))
        .limit(1);

      const businessName = settings?.businessName || tenant?.name || "";

      const template = productExpiryReminder({
        clientName,
        productName: reservation.productName,
        remainingAmount: reservation.remainingAmount,
        unit: reservation.unit,
        expiryDate: reservation.expiryDate || "",
        businessName,
      });

      // Send SMS if enabled
      if (settings?.smsEnabled && clientPhone) {
        const [smsNotification] = await db
          .insert(notifications)
          .values({
            tenantId: reservation.tenantId,
            type: "product_expiry_reminder",
            channel: "sms",
            recipient: clientPhone,
            body: template.sms,
            status: "pending",
          })
          .returning();

        const sent = await sendNotification({
          to: clientPhone,
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
    }

    return success({
      message: "Expire reservations cron completed",
      expiredCount: expired.length,
      notificationsProcessed: nearingExpiry.length,
      results: { smsSent, smsFailed, emailSent, emailFailed },
    });
  } catch (error) {
    console.error("GET /api/cron/expire-reservations error:", error);
    return serverError();
  }
}
