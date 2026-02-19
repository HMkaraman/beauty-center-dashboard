import { apiFetch } from "./client";
import type { ServiceCategory } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const serviceCategoriesApi = {
  list: (params?: { sectionId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.sectionId) searchParams.set("sectionId", params.sectionId);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<ServiceCategory>>(`/service-categories${qs ? `?${qs}` : ""}`);
  },
  create: (data: Partial<ServiceCategory>) =>
    apiFetch<ServiceCategory>("/service-categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ServiceCategory>) =>
    apiFetch<ServiceCategory>(`/service-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/service-categories/${id}`, { method: "DELETE" }),
};
