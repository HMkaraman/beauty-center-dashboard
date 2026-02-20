import { apiFetch } from "./client";
import type { Service, ServiceDetailResponse } from "@/types";

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
  getDetails: (id: string) => apiFetch<ServiceDetailResponse>(`/services/${id}/details`),
  create: (data: Partial<Service>) =>
    apiFetch<Service>("/services", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Service>) =>
    apiFetch<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/services/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) =>
    apiFetch<{ deleted: number }>("/services/bulk", { method: "DELETE", body: JSON.stringify({ ids }) }),
  bulkUpdateStatus: (data: { ids: string[]; status: string }) =>
    apiFetch<{ updated: number }>("/services/bulk", { method: "PATCH", body: JSON.stringify(data) }),
  getInventory: (id: string) =>
    apiFetch<{ id: string; inventoryItemId: string; quantityRequired: number }[]>(`/services/${id}/inventory`),
  updateInventory: (id: string, requirements: { inventoryItemId: string; quantityRequired: number }[]) =>
    apiFetch(`/services/${id}/inventory`, { method: "PUT", body: JSON.stringify({ requirements }) }),
  getEmployees: (id: string) =>
    apiFetch<{ id: string; name: string; role: string }[]>(`/services/${id}/employees`),
  updateEmployees: (id: string, employeeIds: string[]) =>
    apiFetch(`/services/${id}/employees`, { method: "PUT", body: JSON.stringify({ employeeIds }) }),
};
