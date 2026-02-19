import { db } from "@/db/db";
import { activityLogs, activityLogAttachments, activityLogRelations } from "@/db/schema";
import type { AuthenticatedSession } from "@/lib/api-utils";

export type ActivityEntityType =
  | "appointment"
  | "client"
  | "employee"
  | "doctor"
  | "invoice"
  | "expense"
  | "service"
  | "inventory_item"
  | "campaign"
  | "transaction";

export type ActivityAction = "create" | "update" | "delete" | "note";

export interface FieldChange {
  old: unknown;
  new: unknown;
}

export type ChangesMap = Record<string, FieldChange>;

interface LogActivityParams {
  session: AuthenticatedSession;
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityAction;
  entityLabel?: string;
  oldRecord?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  content?: string;
  changes?: ChangesMap;
  attachments?: { url: string; filename?: string; mimeType?: string; fileSize?: number }[];
  relatedEntities?: Array<{ entityType: ActivityEntityType; entityId: string }>;
}

const SKIP_FIELDS = new Set([
  "id",
  "tenantId",
  "tenant_id",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
]);

export function computeChanges(
  oldRecord: Record<string, unknown>,
  newData: Record<string, unknown>
): ChangesMap | null {
  const changes: ChangesMap = {};

  for (const key of Object.keys(newData)) {
    if (SKIP_FIELDS.has(key)) continue;
    if (newData[key] === undefined) continue;

    const oldVal = oldRecord[key];
    const newVal = newData[key];

    // Normalize for comparison — convert numbers/decimals to strings
    const oldStr = oldVal == null ? "" : String(oldVal);
    const newStr = newVal == null ? "" : String(newVal);

    if (oldStr !== newStr) {
      changes[key] = { old: oldVal ?? null, new: newVal ?? null };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

export function buildCreateChanges(
  record: Record<string, unknown>
): ChangesMap {
  const changes: ChangesMap = {};
  for (const [key, value] of Object.entries(record)) {
    if (SKIP_FIELDS.has(key)) continue;
    if (value == null || value === "") continue;
    changes[key] = { old: null, new: value };
  }
  return changes;
}

const RELATED_ENTITY_MAP: Record<string, ActivityEntityType> = {
  clientId: "client",
  employeeId: "employee",
  doctorId: "doctor",
  serviceId: "service",
};

export function buildRelatedEntities(
  refs: Record<string, string | null | undefined>
): Array<{ entityType: ActivityEntityType; entityId: string }> {
  const result: Array<{ entityType: ActivityEntityType; entityId: string }> = [];
  for (const [key, val] of Object.entries(refs)) {
    if (val && RELATED_ENTITY_MAP[key]) {
      result.push({ entityType: RELATED_ENTITY_MAP[key], entityId: val });
    }
  }
  return result;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const {
      session,
      entityType,
      entityId,
      action,
      entityLabel,
      oldRecord,
      newData,
      content,
      attachments,
      relatedEntities,
    } = params;

    let changes = params.changes ?? null;

    // Auto-compute changes for updates if oldRecord and newData provided
    if (action === "update" && oldRecord && newData && !changes) {
      changes = computeChanges(oldRecord, newData);
      // If nothing actually changed, skip logging
      if (!changes) return;
    }

    const [log] = await db
      .insert(activityLogs)
      .values({
        tenantId: session.user.tenantId,
        entityType,
        entityId,
        action,
        userId: session.user.id,
        userName: session.user.name,
        changes: changes as Record<string, unknown> | null,
        content,
        entityLabel,
      })
      .returning();

    // Insert attachments if any
    if (attachments && attachments.length > 0 && log) {
      await db.insert(activityLogAttachments).values(
        attachments.map((a) => ({
          tenantId: session.user.tenantId,
          activityLogId: log.id,
          url: a.url,
          filename: a.filename,
          mimeType: a.mimeType,
          fileSize: a.fileSize,
        }))
      );
    }

    // Insert related entity links
    if (relatedEntities && relatedEntities.length > 0 && log) {
      await db.insert(activityLogRelations).values(
        relatedEntities.map((rel) => ({
          tenantId: session.user.tenantId,
          activityLogId: log.id,
          entityType: rel.entityType,
          entityId: rel.entityId,
        }))
      );
    }
  } catch (error) {
    // Fire-and-forget: never fail the parent operation
    console.error("Activity log error:", error);
  }
}
