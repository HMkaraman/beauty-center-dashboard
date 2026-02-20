import { apiFetch } from "./client";
import type { ClientProductReservation, LeftoverDashboardData } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const reservationsApi = {
  list: (params?: { clientId?: string; status?: string; expiringBefore?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.clientId) searchParams.set("clientId", params.clientId);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.expiringBefore) searchParams.set("expiringBefore", params.expiringBefore);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<ClientProductReservation>>(`/reservations${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<ClientProductReservation>(`/reservations/${id}`),
  update: (id: string, data: Partial<ClientProductReservation>) =>
    apiFetch<ClientProductReservation>(`/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  recordTouchUp: (id: string, data: {
    touchUpAppointmentId?: string;
    touchUpAmountUsed: number;
    touchUpIsFree?: boolean;
    notes?: string;
  }) =>
    apiFetch<ClientProductReservation>(`/reservations/${id}/touch-up`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDashboard: () =>
    apiFetch<LeftoverDashboardData>("/reservations/dashboard"),
  getClientReservations: (clientId: string, status?: string) => {
    const searchParams = new URLSearchParams();
    if (status) searchParams.set("status", status);
    const qs = searchParams.toString();
    return apiFetch<{ data: ClientProductReservation[] }>(`/clients/${clientId}/reservations${qs ? `?${qs}` : ""}`);
  },
};
