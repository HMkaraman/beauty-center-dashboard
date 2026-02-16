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

export const dashboardApi = {
  get: () => apiFetch<DashboardStats>("/dashboard"),
};
