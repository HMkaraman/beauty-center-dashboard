"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { FinanceRevenueChart } from "./finance-revenue-chart";
import { FinanceAreaChart } from "./finance-area-chart";
import { ExpensesCategoryChart } from "@/components/expenses/expenses-category-chart";
import { ExpensesMonthlyChart } from "@/components/expenses/expenses-monthly-chart";
import {
  financeKpiData,
  financeRevenueByCategoryData,
  financeRevenueExpensesTrendData,
  expensesByCategoryData,
  expensesMonthlyTrendData,
} from "@/lib/mock-data";

export function FinanceOverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {financeKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceRevenueChart data={financeRevenueByCategoryData} />
        <FinanceAreaChart data={financeRevenueExpensesTrendData} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ExpensesCategoryChart data={expensesByCategoryData} />
        <ExpensesMonthlyChart data={expensesMonthlyTrendData} />
      </div>
    </div>
  );
}
