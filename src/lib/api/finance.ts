import { apiFetch } from "./client";
import type { Transaction, TransactionType } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const financeApi = {
  list: (params?: { page?: number; limit?: number; search?: string; type?: TransactionType }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.type) searchParams.set("type", params.type);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Transaction>>(`/finance${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Transaction>(`/finance/${id}`),
  create: (data: Partial<Transaction>) =>
    apiFetch<Transaction>("/finance", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Transaction>) =>
    apiFetch<Transaction>(`/finance/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/finance/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/finance/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
};
