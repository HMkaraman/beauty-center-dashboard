import { apiFetch } from "./client";
import type { KPIData, ChartDataPoint, DonutSegment, ProfitabilityData, TopEmployee } from "@/types";

export interface DashboardStats {
  kpis: KPIData[];
  revenueChart: ChartDataPoint[];
  appointmentsChart: ChartDataPoint[];
  serviceBreakdown: DonutSegment[];
  profitability: ProfitabilityData;
  topEmployees: TopEmployee[];
}

export interface DashboardStatsRaw {
  totalRevenue: number;
  totalAppointments: number;
  totalClients: number;
  totalExpenses: number;
}

export const dashboardApi = {
  get: (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    const qs = searchParams.toString();
    return apiFetch<DashboardStatsRaw>(`/dashboard${qs ? `?${qs}` : ""}`);
  },
};
