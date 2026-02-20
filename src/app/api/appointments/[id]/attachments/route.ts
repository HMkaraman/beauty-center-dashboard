import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  notFound,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { appointments, appointmentAttachments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;

    // Verify appointment exists
    const [appointment] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)));

    if (!appointment) return notFound("Appointment not found");

    const attachments = await db
      .select()
      .from(appointmentAttachments)
      .where(
        and(
          eq(appointmentAttachments.tenantId, tenantId),
          eq(appointmentAttachments.appointmentId, id)
        )
      )
      .orderBy(desc(appointmentAttachments.createdAt));

    return success(
      attachments.map((att) => ({
        id: att.id,
        appointmentId: att.appointmentId,
        url: att.url,
        filename: att.filename,
        mimeType: att.mimeType,
        label: att.label,
        caption: att.caption,
        createdAt: att.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("GET /api/appointments/[id]/attachments error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();

    if (!body.url) return badRequest("url is required");

    // Verify appointment exists
    const [appointment] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.tenantId, tenantId)));

    if (!appointment) return notFound("Appointment not found");

    const [attachment] = await db
      .insert(appointmentAttachments)
      .values({
        tenantId,
        appointmentId: id,
        url: body.url,
        filename: body.filename || null,
        mimeType: body.mimeType || null,
        label: body.label || null,
        caption: body.caption || null,
      })
      .returning();

    return success(
      {
        id: attachment.id,
        appointmentId: attachment.appointmentId,
        url: attachment.url,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        label: attachment.label,
        caption: attachment.caption,
        createdAt: attachment.createdAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error("POST /api/appointments/[id]/attachments error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();

    if (!body.attachmentId) return badRequest("attachmentId is required");

    const [deleted] = await db
      .delete(appointmentAttachments)
      .where(
        and(
          eq(appointmentAttachments.id, body.attachmentId),
          eq(appointmentAttachments.tenantId, tenantId),
          eq(appointmentAttachments.appointmentId, id)
        )
      )
      .returning();

    if (!deleted) return notFound("Attachment not found");

    return success({ message: "Attachment deleted" });
  } catch (error) {
    console.error("DELETE /api/appointments/[id]/attachments error:", error);
    return serverError();
  }
}
