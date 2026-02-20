"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { FinanceRevenueChart } from "./finance-revenue-chart";
import { FinanceAreaChart } from "./finance-area-chart";
import { ExpensesCategoryChart } from "@/components/expenses/expenses-category-chart";
import { ExpensesMonthlyChart } from "@/components/expenses/expenses-monthly-chart";
import { useFinanceOverview } from "@/lib/hooks/use-finance";
import { useTranslations } from "next-intl";
import type { KPIData } from "@/types";

export function FinanceOverviewTab() {
  const t = useTranslations("finance");
  const { data: overview, isLoading } = useFinanceOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[320px] animate-pulse rounded-lg bg-muted" />
          <div className="h-[320px] animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  const kpiData: KPIData[] = [
    {
      id: "revenue",
      label: "finance.totalRevenue",
      value: overview.revenue,
      change: overview.revenueChange,
      icon: "DollarSign",
      format: "currency",
    },
    {
      id: "expenses",
      label: "finance.totalExpenses",
      value: overview.expenses,
      change: overview.expensesChange,
      icon: "TrendingDown",
      format: "currency",
    },
    {
      id: "profit",
      label: "finance.netProfit",
      value: overview.netProfit,
      change: overview.netProfitChange,
      icon: "TrendingUp",
      format: "currency",
    },
    {
      id: "margin",
      label: "finance.profitMargin",
      value: overview.margin,
      change: 0,
      icon: "Percent",
      format: "percentage",
    },
  ];

  // Revenue by service — use names directly from DB (no i18n key translation needed)
  const revenueByServiceData = overview.revenueByService.map((s) => ({
    ...s,
    name: s.name, // Already display-ready from DB
  }));

  // Monthly trend data — use month names directly
  const monthlyTrendData = overview.monthlyTrend.map((m) => ({
    name: m.name,
    revenue: m.revenue,
    expenses: m.expenses,
  }));

  // Expense breakdown — use category names directly from DB
  const expenseBreakdownData = overview.expenseBreakdown.map((e) => ({
    ...e,
    name: e.name,
  }));

  // For expenses monthly chart, reformat from monthly trend
  const expensesMonthlyData = overview.monthlyTrend.map((m) => ({
    name: m.name,
    value: m.expenses,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceRevenueChart data={revenueByServiceData} />
        <FinanceAreaChart data={monthlyTrendData} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ExpensesCategoryChart data={expenseBreakdownData} />
        <ExpensesMonthlyChart data={expensesMonthlyData} />
      </div>
    </div>
  );
}
