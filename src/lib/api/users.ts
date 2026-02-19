import { apiFetch } from "./client";
import type { AdminUser } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminUsersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedResponse<AdminUser>>(`/users${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<AdminUser>(`/users/${id}`),
  create: (data: {
    name: string;
    email: string;
    password: string;
    roleId: string;
  }) => apiFetch<AdminUser>("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      roleId?: string;
      customPermissions?: { granted: string[]; revoked: string[] } | null;
    }
  ) => apiFetch<AdminUser>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};
