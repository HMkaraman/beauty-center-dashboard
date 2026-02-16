import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });
}

export function useAdminTenants(params?: { search?: string }) {
  return useQuery({
    queryKey: ["admin", "tenants", params],
    queryFn: () => adminApi.getTenants(params),
  });
}
