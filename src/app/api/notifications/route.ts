import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  getPaginationParams,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { notifications, tenantSettings } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { page, limit, offset } = getPaginationParams(req);
    const tenantId = session.user.tenantId;

    const url = new URL(req.url);
    const typeFilter = url.searchParams.get("type");
    const channelFilter = url.searchParams.get("channel");
    const statusFilter = url.searchParams.get("status");

    const conditions = [eq(notifications.tenantId, tenantId)];

    if (typeFilter) {
      conditions.push(
        sql`${notifications.type} = ${typeFilter}`
      );
    }
    if (channelFilter) {
      conditions.push(
        sql`${notifications.channel} = ${channelFilter}`
      );
    }
    if (statusFilter) {
      conditions.push(
        sql`${notifications.status} = ${statusFilter}`
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ total: count() })
      .from(notifications)
      .where(whereClause);

    const rows = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return success({
      data: rows,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const { recipient, subject, message, channel, type } = body as {
      recipient?: string;
      subject?: string;
      message?: string;
      channel?: string;
      type?: string;
    };

    if (!recipient || !message || !channel) {
      return badRequest("recipient, message, and channel are required");
    }

    if (channel !== "sms" && channel !== "email") {
      return badRequest("channel must be 'sms' or 'email'");
    }

    const tenantId = session.user.tenantId;

    // Check if channel is enabled for this tenant
    const [settings] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);

    if (channel === "sms" && settings && !settings.smsEnabled) {
      return badRequest("SMS notifications are disabled for this tenant");
    }
    if (channel === "email" && settings && !settings.emailEnabled) {
      return badRequest("Email notifications are disabled for this tenant");
    }

    // Create notification record
    const [notification] = await db
      .insert(notifications)
      .values({
        tenantId,
        type: (type as "appointment_confirmation" | "appointment_reminder" | "invoice_receipt" | "low_stock_alert" | "custom") || "custom",
        channel,
        recipient,
        subject: subject || null,
        body: message,
        status: "pending",
      })
      .returning();

    // Send the notification
    const sent = await sendNotification({
      to: recipient,
      subject,
      body: message,
      type: channel,
    });

    // Update status based on result
    const [updated] = await db
      .update(notifications)
      .set({
        status: sent ? "sent" : "failed",
        sentAt: sent ? new Date() : null,
      })
      .where(eq(notifications.id, notification.id))
      .returning();

    return success(updated, 201);
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return serverError();
  }
}
