import { apiFetch } from "./client";

export interface InAppNotification {
  id: string;
  notificationId: string;
  isRead: number;
  readAt: string | null;
  isArchived: number;
  createdAt: string;
  category: string;
  priority: string;
  title: string;
  titleEn: string | null;
  body: string | null;
  bodyEn: string | null;
  icon: string | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  actorName: string | null;
  metadata: Record<string, unknown> | null;
}

interface PaginatedResponse {
  data: InAppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  count: number;
}

type UnreadCountsByCategoryResponse = Record<string, number>;

export type NotificationPreferences = Record<string, { inAppEnabled: boolean }>;

export const inAppNotificationsApi = {
  list: (params?: { category?: string; page?: number; limit?: number; unreadOnly?: boolean; archived?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.unreadOnly) searchParams.set("unreadOnly", "true");
    if (params?.archived) searchParams.set("archived", "true");
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse>(`/in-app-notifications${qs ? `?${qs}` : ""}`);
  },

  unreadCount: () =>
    apiFetch<UnreadCountResponse>("/in-app-notifications/unread-count"),

  markRead: (id: string) =>
    apiFetch<{ message: string }>(`/in-app-notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: (category?: string) => {
    const qs = category ? `?category=${category}` : "";
    return apiFetch<{ message: string }>(`/in-app-notifications/mark-all-read${qs}`, {
      method: "PATCH",
    });
  },

  archive: (id: string) =>
    apiFetch<{ message: string }>(`/in-app-notifications/${id}/archive`, {
      method: "PATCH",
    }),

  archiveAll: () =>
    apiFetch<{ message: string }>("/in-app-notifications/archive-all", {
      method: "PATCH",
    }),

  unreadCountsByCategory: () =>
    apiFetch<UnreadCountsByCategoryResponse>("/in-app-notifications/unread-counts-by-category"),

  getPreferences: () =>
    apiFetch<NotificationPreferences>("/in-app-notifications/preferences"),

  updatePreferences: (data: { category: string; inAppEnabled: boolean }) =>
    apiFetch<{ message: string }>("/in-app-notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
