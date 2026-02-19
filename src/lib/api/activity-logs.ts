import { apiFetch } from "./client";
import type { ActivityLog, ActivityEntityType } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateNoteData {
  entityType: ActivityEntityType;
  entityId: string;
  content: string;
  attachments?: { url: string; filename?: string; mimeType?: string; fileSize?: number }[];
}

export const activityLogsApi = {
  list: (params: { entityType: ActivityEntityType; entityId: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.set("entityType", params.entityType);
    searchParams.set("entityId", params.entityId);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    return apiFetch<PaginatedResponse<ActivityLog>>(`/activity-logs?${searchParams.toString()}`);
  },
  createNote: (data: CreateNoteData) =>
    apiFetch<ActivityLog>("/activity-logs", { method: "POST", body: JSON.stringify(data) }),
};
