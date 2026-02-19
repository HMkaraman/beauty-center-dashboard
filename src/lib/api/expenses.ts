import { apiFetch } from "./client";
import type { Expense, ExpenseStatus } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const expensesApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: ExpenseStatus }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Expense>>(`/expenses${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Expense>(`/expenses/${id}`),
  create: (data: Partial<Expense>) =>
    apiFetch<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Expense>) =>
    apiFetch<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/expenses/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/expenses/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  bulkUpdateStatus: (data: { ids: string[]; status: string }) =>
    apiFetch<{ updated: number }>("/expenses/bulk", { method: "PATCH", body: JSON.stringify(data) }),
};
