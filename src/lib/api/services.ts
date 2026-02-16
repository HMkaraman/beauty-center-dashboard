import { apiFetch } from "./client";
import type { Service } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const servicesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Service>>(`/services${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Service>(`/services/${id}`),
  create: (data: Partial<Service>) =>
    apiFetch<Service>("/services", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Service>) =>
    apiFetch<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/services/${id}`, { method: "DELETE" }),
};
