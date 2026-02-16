import { apiFetch } from "./client";

export interface Notification {
  id: string;
  tenantId: string;
  type: "appointment_confirmation" | "appointment_reminder" | "invoice_receipt" | "low_stock_alert" | "custom";
  channel: "sms" | "email";
  recipient: string;
  subject: string | null;
  body: string;
  status: "sent" | "failed" | "pending";
  sentAt: string | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SendNotificationData {
  recipient: string;
  subject?: string;
  message: string;
  channel: "sms" | "email";
  type?: "appointment_confirmation" | "appointment_reminder" | "invoice_receipt" | "low_stock_alert" | "custom";
}

export const notificationsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    channel?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.type) searchParams.set("type", params.type);
    if (params?.channel) searchParams.set("channel", params.channel);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Notification>>(
      `/notifications${qs ? `?${qs}` : ""}`
    );
  },

  send: (data: SendNotificationData) =>
    apiFetch<Notification>("/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
