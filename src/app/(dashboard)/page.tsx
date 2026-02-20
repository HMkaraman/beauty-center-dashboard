"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { MiniKPICard } from "@/components/ui/mini-kpi-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ProfitabilityBanner } from "@/components/dashboard/profitability-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import {
  kpiData as mockKpiData,
  profitabilityData as mockProfitabilityData,
  revenueExpensesData,
  revenueByServiceData,
  appointmentsTrendData,
  topEmployees,
  miniKpiData,
  quickActions,
} from "@/lib/mock-data";
import type { KPIData, ProfitabilityData } from "@/types";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();

  // Merge real data into KPI cards when available
  const kpiData: KPIData[] = data
    ? [
        { ...mockKpiData[0], value: data.totalRevenue },
        { ...mockKpiData[1], value: data.totalAppointments },
        { ...mockKpiData[2], value: data.totalClients },
        {
          ...mockKpiData[3],
          value: data.totalAppointments > 0
            ? Math.round(data.totalRevenue / data.totalAppointments)
            : 0,
        },
      ]
    : mockKpiData;

  const profitabilityData: ProfitabilityData = data
    ? {
        revenue: data.totalRevenue,
        expenses: data.totalExpenses,
        profit: data.totalRevenue - data.totalExpenses,
        margin: data.totalRevenue > 0
          ? Math.round(((data.totalRevenue - data.totalExpenses) / data.totalRevenue) * 100)
          : 0,
        previousMargin: mockProfitabilityData.previousMargin,
      }
    : mockProfitabilityData;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Loading overlay for KPI area */}
      {isLoading && (
        <div className="absolute inset-0 pointer-events-none" />
      )}

      {/* Profitability Banner */}
      <ProfitabilityBanner data={profitabilityData} />

      {/* Charts Grid */}
      <DashboardCharts
        revenueExpensesData={revenueExpensesData}
        revenueByServiceData={revenueByServiceData}
        appointmentsTrendData={appointmentsTrendData}
        topEmployees={topEmployees}
      />

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {miniKpiData.map((kpi) => (
          <MiniKPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </div>
  );
}
