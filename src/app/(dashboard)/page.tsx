import { KPICard } from "@/components/ui/kpi-card";
import { MiniKPICard } from "@/components/ui/mini-kpi-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ProfitabilityBanner } from "@/components/dashboard/profitability-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  kpiData,
  profitabilityData,
  revenueExpensesData,
  revenueByServiceData,
  appointmentsTrendData,
  topEmployees,
  miniKpiData,
  quickActions,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

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
