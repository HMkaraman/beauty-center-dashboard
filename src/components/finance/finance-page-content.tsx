"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { FinanceRevenueChart } from "./finance-revenue-chart";
import { FinanceAreaChart } from "./finance-area-chart";
import { FinanceTable } from "./finance-table";
import { TransactionCard } from "./transaction-card";
import { NewTransactionSheet } from "./new-transaction-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  financeKpiData,
  financeRevenueByCategoryData,
  financeRevenueExpensesTrendData,
  financeTransactionsData,
} from "@/lib/mock-data";

export function FinancePageContent() {
  const t = useTranslations("finance");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {financeKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FinanceRevenueChart data={financeRevenueByCategoryData} />
        <FinanceAreaChart data={financeRevenueExpensesTrendData} />
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("transactionsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newTransaction")}
          </Button>
        </div>

        <FinanceTable data={financeTransactionsData} />

        <div className="space-y-3 md:hidden">
          {financeTransactionsData.map((transaction) => (
            <TransactionCard key={transaction.id} data={transaction} />
          ))}
        </div>
      </div>

      <NewTransactionSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
