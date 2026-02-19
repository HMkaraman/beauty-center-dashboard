import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  badRequest,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { activityLogs, activityLogAttachments } from "@/db/schema";
import { activityNoteSchema } from "@/lib/validations";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { activityEntityTypeEnum } from "@/db/schema/activity-logs";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const url = new URL(req.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const tenantId = session.user.tenantId;

    if (!entityType || !entityId) {
      return badRequest("entityType and entityId are required");
    }

    const validTypes = activityEntityTypeEnum.enumValues as readonly string[];
    if (!validTypes.includes(entityType)) {
      return badRequest("Invalid entityType");
    }

    const whereClause = and(
      eq(activityLogs.tenantId, tenantId),
      eq(activityLogs.entityType, entityType as (typeof activityEntityTypeEnum.enumValues)[number]),
      eq(activityLogs.entityId, entityId),
    );

    const [totalResult] = await db
      .select({ total: count() })
      .from(activityLogs)
      .where(whereClause);

    const total = totalResult.total;

    const data = await db
      .select()
      .from(activityLogs)
      .where(whereClause)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch attachments for note entries
    const noteLogIds = data.filter((l) => l.action === "note").map((l) => l.id);
    const attachmentsByLogId: Record<string, typeof activityLogAttachments.$inferSelect[]> = {};

    if (noteLogIds.length > 0) {
      const allAttachments = await db
        .select()
        .from(activityLogAttachments)
        .where(
          and(
            eq(activityLogAttachments.tenantId, tenantId),
            inArray(activityLogAttachments.activityLogId, noteLogIds),
          )
        );

      for (const att of allAttachments) {
        if (!attachmentsByLogId[att.activityLogId]) {
          attachmentsByLogId[att.activityLogId] = [];
        }
        attachmentsByLogId[att.activityLogId].push(att);
      }
    }

    const enrichedData = data.map((log) => ({
      ...log,
      attachments: attachmentsByLogId[log.id] ?? [],
    }));

    return success({
      data: enrichedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/activity-logs error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const result = activityNoteSchema.safeParse(body);

    if (!result.success) {
      return badRequest(result.error.issues[0]?.message ?? "Invalid input");
    }

    const validated = result.data;

    const [log] = await db
      .insert(activityLogs)
      .values({
        tenantId: session.user.tenantId,
        entityType: validated.entityType,
        entityId: validated.entityId,
        action: "note",
        userId: session.user.id,
        userName: session.user.name,
        content: validated.content,
      })
      .returning();

    let attachments: typeof activityLogAttachments.$inferSelect[] = [];

    if (validated.attachments && validated.attachments.length > 0) {
      attachments = await db
        .insert(activityLogAttachments)
        .values(
          validated.attachments.map((a) => ({
            tenantId: session.user.tenantId,
            activityLogId: log.id,
            url: a.url,
            filename: a.filename,
            mimeType: a.mimeType,
            fileSize: a.fileSize,
          }))
        )
        .returning();
    }

    return success({ ...log, attachments }, 201);
  } catch (error) {
    console.error("POST /api/activity-logs error:", error);
    return serverError();
  }
}
