import { apiFetch } from "./client";
import type { RoleType } from "@/types";

export const rolesApi = {
  list: () => apiFetch<{ data: RoleType[] }>("/roles"),
  get: (id: string) => apiFetch<RoleType>(`/roles/${id}`),
  create: (data: {
    name: string;
    nameEn?: string;
    slug: string;
    description?: string;
    permissions: string[];
    isDefault?: boolean;
  }) => apiFetch<RoleType>("/roles", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: {
      name?: string;
      nameEn?: string;
      slug?: string;
      description?: string;
      permissions?: string[];
      isDefault?: boolean;
    }
  ) => apiFetch<RoleType>(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/roles/${id}`, { method: "DELETE" }),
};
