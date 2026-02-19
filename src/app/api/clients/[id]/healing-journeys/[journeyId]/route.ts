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
import { healingJourneys, healingJourneyEntries, healingJourneyAttachments } from "@/db/schema";
import { healingJourneySchema } from "@/lib/validations";
import { eq, and, desc } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string; journeyId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;
    const tenantId = session.user.tenantId;

    const [journey] = await db
      .select()
      .from(healingJourneys)
      .where(
        and(
          eq(healingJourneys.id, journeyId),
          eq(healingJourneys.tenantId, tenantId)
        )
      );

    if (!journey) return notFound("Journey not found");

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

    const attachmentsRaw = entriesRaw.length > 0
      ? await db
          .select()
          .from(healingJourneyAttachments)
          .where(
            and(
              eq(healingJourneyAttachments.tenantId, tenantId),
            )
          )
      : [];

    const attachmentsByEntry = new Map<string, typeof attachmentsRaw>();
    for (const att of attachmentsRaw) {
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

    return success({ journey, entries });
  } catch (error) {
    console.error("GET /api/clients/[id]/healing-journeys/[journeyId] error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;
    const body = await req.json();
    const result = healingJourneySchema.partial().safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [updated] = await db
      .update(healingJourneys)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(healingJourneys.id, journeyId),
          eq(healingJourneys.tenantId, session.user.tenantId)
        )
      )
      .returning();

    if (!updated) return notFound("Journey not found");

    return success(updated);
  } catch (error) {
    console.error("PATCH /api/clients/[id]/healing-journeys/[journeyId] error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const { journeyId } = await params;

    const [deleted] = await db
      .delete(healingJourneys)
      .where(
        and(
          eq(healingJourneys.id, journeyId),
          eq(healingJourneys.tenantId, session.user.tenantId)
        )
      )
      .returning();

    if (!deleted) return notFound("Journey not found");

    return success({ message: "Journey deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/clients/[id]/healing-journeys/[journeyId] error:", error);
    return serverError();
  }
}
