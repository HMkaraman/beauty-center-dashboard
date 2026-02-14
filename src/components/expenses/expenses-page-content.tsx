"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { ExpensesCategoryChart } from "./expenses-category-chart";
import { ExpensesMonthlyChart } from "./expenses-monthly-chart";
import { ExpensesTable } from "./expenses-table";
import { ExpenseCard } from "./expense-card";
import { NewExpenseSheet } from "./new-expense-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  expensesKpiData,
  expensesByCategoryData,
  expensesMonthlyTrendData,
  expensesListData,
} from "@/lib/mock-data";

export function ExpensesPageContent() {
  const t = useTranslations("expenses");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {expensesKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ExpensesCategoryChart data={expensesByCategoryData} />
        <ExpensesMonthlyChart data={expensesMonthlyTrendData} />
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("expensesList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newExpense")}
          </Button>
        </div>

        <ExpensesTable data={expensesListData} />

        <div className="space-y-3 md:hidden">
          {expensesListData.map((expense) => (
            <ExpenseCard key={expense.id} data={expense} />
          ))}
        </div>
      </div>

      <NewExpenseSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
