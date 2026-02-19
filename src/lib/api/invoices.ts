import { apiFetch } from "./client";
import type { Invoice } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const invoicesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Invoice>>(`/invoices${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Invoice>(`/invoices/${id}`),
  create: (data: Partial<Invoice>) =>
    apiFetch<Invoice>("/invoices", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Invoice>) =>
    apiFetch<Invoice>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/invoices/${id}`, { method: "DELETE" }),
  bulkVoid: (ids: string[]) =>
    apiFetch<{ voided: number }>("/invoices/bulk", { method: "PATCH", body: JSON.stringify({ ids }) }),
};
