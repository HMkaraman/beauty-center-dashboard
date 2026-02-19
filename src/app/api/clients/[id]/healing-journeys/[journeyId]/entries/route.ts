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
import { healingJourneyEntries, healingJourneyAttachments } from "@/db/schema";
import { journeyEntrySchema } from "@/lib/validations";
import { eq, and, desc } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string; journeyId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;
    const tenantId = session.user.tenantId;

    const entriesRaw = await db
      .select()
      .from(healingJourneyEntries)
      .where(
        and(
          eq(healingJourneyEntries.journeyId, journeyId),
          eq(healingJourneyEntries.tenantId, tenantId)
        )
      )
      .orderBy(desc(healingJourneyEntries.date));

    const entryIds = entriesRaw.map((e) => e.id);

    const attachmentsRaw = entryIds.length > 0
      ? await db
          .select()
          .from(healingJourneyAttachments)
          .where(eq(healingJourneyAttachments.tenantId, tenantId))
      : [];

    const attachmentsByEntry = new Map<string, typeof attachmentsRaw>();
    for (const att of attachmentsRaw) {
      if (!entryIds.includes(att.entryId)) continue;
      const list = attachmentsByEntry.get(att.entryId) ?? [];
      list.push(att);
      attachmentsByEntry.set(att.entryId, list);
    }

    const entries = entriesRaw.map((entry) => ({
      ...entry,
      price: entry.price ? Number(entry.price) : undefined,
      attachments: (attachmentsByEntry.get(entry.id) ?? []).map((a) => ({
        id: a.id,
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        filename: a.filename,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        label: a.label,
        bodyRegion: a.bodyRegion,
        caption: a.caption,
      })),
    }));

    return success(entries);
  } catch (error) {
    console.error("GET /api/clients/[id]/healing-journeys/[journeyId]/entries error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;
    const tenantId = session.user.tenantId;
    const body = await req.json();
    const result = journeyEntrySchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;
    const { attachments, ...entryData } = validated;

    const [created] = await db
      .insert(healingJourneyEntries)
      .values({
        tenantId,
        journeyId,
        createdById: session.user.id,
        type: entryData.type,
        date: entryData.date,
        notes: entryData.notes,
        // session fields
        ...(entryData.type === "session" ? {
          serviceId: entryData.serviceId,
          serviceName: entryData.serviceName,
          doctorId: entryData.doctorId,
          doctorName: entryData.doctorName,
          employeeId: entryData.employeeId,
          employeeName: entryData.employeeName,
          price: entryData.price?.toString(),
          duration: entryData.duration,
          appointmentId: entryData.appointmentId,
          invoiceId: entryData.invoiceId,
        } : {}),
        // prescription fields
        ...(entryData.type === "prescription" ? {
          prescriptionText: entryData.prescriptionText,
          prescribedByDoctorId: entryData.prescribedByDoctorId,
          prescribedByDoctorName: entryData.prescribedByDoctorName,
        } : {}),
        // milestone fields
        ...(entryData.type === "milestone" ? {
          milestoneLabel: entryData.milestoneLabel,
        } : {}),
      })
      .returning();

    // Insert attachments if any
    if (attachments && attachments.length > 0) {
      await db.insert(healingJourneyAttachments).values(
        attachments.map((att, i) => ({
          tenantId,
          entryId: created.id,
          url: att.url,
          thumbnailUrl: att.thumbnailUrl,
          filename: att.filename,
          mimeType: att.mimeType,
          fileSize: att.fileSize,
          label: att.label,
          bodyRegion: att.bodyRegion,
          caption: att.caption,
          sortOrder: i,
        }))
      );
    }

    // Fetch attachments to return with entry
    const entryAttachments = attachments && attachments.length > 0
      ? await db
          .select()
          .from(healingJourneyAttachments)
          .where(eq(healingJourneyAttachments.entryId, created.id))
      : [];

    return success({
      ...created,
      price: created.price ? Number(created.price) : undefined,
      attachments: entryAttachments.map((a) => ({
        id: a.id,
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        filename: a.filename,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        label: a.label,
        bodyRegion: a.bodyRegion,
        caption: a.caption,
      })),
    }, 201);
  } catch (error) {
    console.error("POST /api/clients/[id]/healing-journeys/[journeyId]/entries error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const url = new URL(req.url);
    const entryId = url.searchParams.get("entryId");
    if (!entryId) return badRequest("entryId is required");

    const tenantId = session.user.tenantId;

    const [deleted] = await db
      .delete(healingJourneyEntries)
      .where(
        and(
          eq(healingJourneyEntries.id, entryId),
          eq(healingJourneyEntries.tenantId, tenantId)
        )
      )
      .returning();

    if (!deleted) return notFound("Entry not found");

    return success({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/clients/[id]/healing-journeys/[journeyId]/entries error:", error);
    return serverError();
  }
}
