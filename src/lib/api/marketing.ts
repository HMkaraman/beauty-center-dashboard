import { apiFetch } from "./client";
import type { Campaign } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const marketingApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Campaign>>(`/marketing${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Campaign>(`/marketing/${id}`),
  create: (data: Partial<Campaign>) =>
    apiFetch<Campaign>("/marketing", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Campaign>) =>
    apiFetch<Campaign>(`/marketing/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/marketing/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/marketing/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  bulkUpdateStatus: (data: { ids: string[]; status: string }) =>
    apiFetch<{ updated: number }>("/marketing/bulk", { method: "PATCH", body: JSON.stringify(data) }),
};
