import { apiFetch } from "./client";
import type { Employee, EmployeeDetailResponse } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const employeesApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<Employee>>(`/employees${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<Employee>(`/employees/${id}`),
  create: (data: Partial<Employee>) =>
    apiFetch<Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Employee>) =>
    apiFetch<Employee>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/employees/${id}`, { method: "DELETE" }),
  getDetails: (id: string) => apiFetch<EmployeeDetailResponse>(`/employees/${id}/details`),
};
