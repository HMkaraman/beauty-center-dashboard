import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { useFilterStore } from "@/store/useFilterStore";

export function useDashboardStats() {
  const { period, dateRange, getEffectiveDateRange } = useFilterStore();
  const effectiveRange = getEffectiveDateRange();

  const from = effectiveRange?.start.toISOString();
  const to = effectiveRange?.end.toISOString();

  return useQuery({
    queryKey: ["dashboard", period, from, to],
    queryFn: () => dashboardApi.get({ from, to }),
  });
}
