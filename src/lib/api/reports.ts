import { apiFetch } from "./client";
import type { Report } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const reportsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Report>>(`/reports${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Report>(`/reports/${id}`),
  create: (data: Partial<Report>) =>
    apiFetch<Report>("/reports", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/reports/${id}`, { method: "DELETE" }),
  generate: (data: { type: string; startDate: string; endDate: string }) =>
    apiFetch<{ summary: Record<string, number | string>; details: Record<string, unknown>[] }>(
      "/reports/generate",
      { method: "POST", body: JSON.stringify(data) }
    ),
};
