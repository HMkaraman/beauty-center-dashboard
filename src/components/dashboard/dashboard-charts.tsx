"use client";

import dynamic from "next/dynamic";
import type { ChartDataPoint, DonutSegment, TopEmployee } from "@/types";

const RevenueExpensesChart = dynamic(
  () =>
    import("@/components/charts/revenue-expenses-chart").then(
      (mod) => mod.RevenueExpensesChart
    ),
  { ssr: false }
);

const RevenueByServiceChart = dynamic(
  () =>
    import("@/components/charts/revenue-by-service-chart").then(
      (mod) => mod.RevenueByServiceChart
    ),
  { ssr: false }
);

const AppointmentsTrendChart = dynamic(
  () =>
    import("@/components/charts/appointments-trend-chart").then(
      (mod) => mod.AppointmentsTrendChart
    ),
  { ssr: false }
);

const TopEmployeesChart = dynamic(
  () =>
    import("@/components/charts/top-employees-chart").then(
      (mod) => mod.TopEmployeesChart
    ),
  { ssr: false }
);

interface DashboardChartsProps {
  revenueExpensesData: ChartDataPoint[];
  revenueByServiceData: DonutSegment[];
  appointmentsTrendData: ChartDataPoint[];
  topEmployees: TopEmployee[];
}

export function DashboardCharts({
  revenueExpensesData,
  revenueByServiceData,
  appointmentsTrendData,
  topEmployees,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RevenueExpensesChart data={revenueExpensesData} />
      <RevenueByServiceChart data={revenueByServiceData} />
      <AppointmentsTrendChart data={appointmentsTrendData} />
      <TopEmployeesChart data={topEmployees} />
    </div>
  );
}
