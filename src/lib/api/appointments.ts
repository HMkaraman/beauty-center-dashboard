import { apiFetch } from "./client";
import type { Appointment, AppointmentStatus } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const appointmentsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: AppointmentStatus }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Appointment>>(`/appointments${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Appointment>(`/appointments/${id}`),
  create: (data: Partial<Appointment>) =>
    apiFetch<Appointment>("/appointments", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Appointment>) =>
    apiFetch<Appointment>(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/appointments/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/appointments/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  bulkUpdateStatus: (data: { ids: string[]; status: string }) =>
    apiFetch<{ updated: number }>("/appointments/bulk", { method: "PATCH", body: JSON.stringify(data) }),
};
