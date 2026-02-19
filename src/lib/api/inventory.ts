import { apiFetch } from "./client";
import type { InventoryItem } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const inventoryApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<InventoryItem>>(`/inventory${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<InventoryItem>(`/inventory/${id}`),
  create: (data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>("/inventory", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/inventory/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/inventory/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
};
