import { apiFetch } from "./client";
import type { Client, ClientDetailResponse } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const clientsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Client>>(`/clients${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Client>(`/clients/${id}`),
  create: (data: Partial<Client>) =>
    apiFetch<Client>("/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Client>) =>
    apiFetch<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/clients/${id}`, { method: "DELETE" }),
  getDetails: (id: string) => apiFetch<ClientDetailResponse>(`/clients/${id}/details`),
};
