import { apiFetch } from "./client";

export interface AdminStats {
  totalTenants: number;
  activeSubscriptions: number;
  mrr: number;
  totalUsers: number;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  currency: string;
  createdAt: string;
  plan: string;
  subscriptionStatus: string;
  maxStaff: number;
  staffCount: number;
}

export interface AdminTenantsResponse {
  data: AdminTenant[];
  total: number;
}

export const adminApi = {
  getStats: () => apiFetch<AdminStats>("/admin/stats"),
  getTenants: (params?: { search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    const qs = searchParams.toString();
    return apiFetch<AdminTenantsResponse>(
      `/admin/tenants${qs ? `?${qs}` : ""}`
    );
  },
};
