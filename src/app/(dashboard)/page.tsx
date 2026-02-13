import { KPICard } from "@/components/ui/kpi-card";
import { MiniKPICard } from "@/components/ui/mini-kpi-card";
import { RevenueExpensesChart } from "@/components/charts/revenue-expenses-chart";
import { RevenueByServiceChart } from "@/components/charts/revenue-by-service-chart";
import { AppointmentsTrendChart } from "@/components/charts/appointments-trend-chart";
import { TopEmployeesChart } from "@/components/charts/top-employees-chart";
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
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueExpensesChart data={revenueExpensesData} />
        <RevenueByServiceChart data={revenueByServiceData} />
        <AppointmentsTrendChart data={appointmentsTrendData} />
        <TopEmployeesChart data={topEmployees} />
      </div>

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
