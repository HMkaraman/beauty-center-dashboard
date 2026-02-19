import { apiFetch } from "./client";
import type { Section } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const sectionsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Section>>(`/sections${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Section>(`/sections/${id}`),
  create: (data: Partial<Section>) =>
    apiFetch<Section>("/sections", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Section>) =>
    apiFetch<Section>(`/sections/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/sections/${id}`, { method: "DELETE" }),
  setEmployees: (id: string, employeeIds: string[]) =>
    apiFetch(`/sections/${id}/employees`, { method: "PUT", body: JSON.stringify({ employeeIds }) }),
  setDoctors: (id: string, doctorIds: string[]) =>
    apiFetch(`/sections/${id}/doctors`, { method: "PUT", body: JSON.stringify({ doctorIds }) }),
};
