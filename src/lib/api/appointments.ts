import { apiFetch } from "./client";
import type { Appointment, AppointmentStatus, AppointmentAttachment, AppointmentDetailResponse } from "@/types";

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
  getAvailableSlots: (params: { date: string; serviceId: string; employeeId?: string; doctorId?: string; excludeId?: string }) => {
    const sp = new URLSearchParams();
    sp.set("date", params.date);
    sp.set("serviceId", params.serviceId);
    if (params.employeeId) sp.set("employeeId", params.employeeId);
    if (params.doctorId) sp.set("doctorId", params.doctorId);
    if (params.excludeId) sp.set("excludeId", params.excludeId);
    return apiFetch<{ slots: Array<{ time: string; employeeId: string; employeeName: string; doctorId?: string; doctorName?: string }> }>(`/appointments/available-slots?${sp}`);
  },
  getAvailableDates: (params: { serviceId: string; employeeId?: string; doctorId?: string; excludeId?: string }) => {
    const sp = new URLSearchParams();
    sp.set("serviceId", params.serviceId);
    sp.set("mode", "dates");
    if (params.employeeId) sp.set("employeeId", params.employeeId);
    if (params.doctorId) sp.set("doctorId", params.doctorId);
    if (params.excludeId) sp.set("excludeId", params.excludeId);
    return apiFetch<{ dates: string[] }>(`/appointments/available-slots?${sp}`);
  },
  getDetails: (id: string) =>
    apiFetch<AppointmentDetailResponse>(`/appointments/${id}/details`),
  getAttachments: (id: string) =>
    apiFetch<AppointmentAttachment[]>(`/appointments/${id}/attachments`),
  addAttachment: (id: string, data: { url: string; filename?: string; mimeType?: string; label?: string; caption?: string }) =>
    apiFetch<AppointmentAttachment>(`/appointments/${id}/attachments`, { method: "POST", body: JSON.stringify(data) }),
  deleteAttachment: (id: string, attachmentId: string) =>
    apiFetch(`/appointments/${id}/attachments`, { method: "DELETE", body: JSON.stringify({ attachmentId }) }),
  createRecurring: (data: {
    appointment: Partial<Appointment>;
    recurrence: { frequency: string; interval?: number; endDate?: string; occurrences?: number };
  }) =>
    apiFetch<{ groupId: string; created: Appointment[]; createdCount: number; skipped: Array<{ date: string; reason: string }>; skippedCount: number; totalRequested: number }>("/appointments/recurring", { method: "POST", body: JSON.stringify(data) }),
};
