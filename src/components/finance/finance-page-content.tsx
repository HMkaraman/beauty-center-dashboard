"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinanceOverviewTab } from "./finance-overview-tab";
import { FinanceTransactionsTab } from "./finance-transactions-tab";
import { ExpensesPageContent } from "@/components/expenses/expenses-page-content";
import { InvoicesPageContent } from "@/components/invoices/invoices-page-content";

export function FinancePageContent() {
  const t = useTranslations("finance");

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
        <TabsTrigger value="transactions">{t("tabs.transactions")}</TabsTrigger>
        <TabsTrigger value="expenses">{t("tabs.expenses")}</TabsTrigger>
        <TabsTrigger value="invoices">{t("tabs.invoices")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <FinanceOverviewTab />
      </TabsContent>

      <TabsContent value="transactions">
        <FinanceTransactionsTab />
      </TabsContent>

      <TabsContent value="expenses">
        <ExpensesPageContent />
      </TabsContent>

      <TabsContent value="invoices">
        <InvoicesPageContent />
      </TabsContent>
    </Tabs>
  );
}
