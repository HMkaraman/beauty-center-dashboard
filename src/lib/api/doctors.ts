import { apiFetch } from "./client";
import type { Doctor, DoctorDetailResponse } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const doctorsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Doctor>>(`/doctors${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Doctor>(`/doctors/${id}`),
  create: (data: Partial<Doctor>) =>
    apiFetch<Doctor>("/doctors", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Doctor>) =>
    apiFetch<Doctor>(`/doctors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/doctors/${id}`, { method: "DELETE" }),
  getDetails: (id: string) => apiFetch<DoctorDetailResponse>(`/doctors/${id}/details`),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/doctors/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  bulkUpdateStatus: (data: { ids: string[]; status: string }) =>
    apiFetch<{ updated: number }>("/doctors/bulk", { method: "PATCH", body: JSON.stringify(data) }),
  getSchedules: (id: string) =>
    apiFetch<Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string; isAvailable: number }>>(`/doctors/${id}/schedules`),
  updateSchedules: (id: string, data: Array<{ dayOfWeek: number; startTime: string; endTime: string; isAvailable?: number }>) =>
    apiFetch(`/doctors/${id}/schedules`, { method: "PUT", body: JSON.stringify(data) }),
};
