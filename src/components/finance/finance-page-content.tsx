"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FinanceOverviewTab = dynamic(
  () =>
    import("./finance-overview-tab").then((mod) => mod.FinanceOverviewTab),
  { ssr: false }
);

const FinanceTransactionsTab = dynamic(
  () =>
    import("./finance-transactions-tab").then(
      (mod) => mod.FinanceTransactionsTab
    ),
  { ssr: false }
);

const ExpensesPageContent = dynamic(
  () =>
    import("@/components/expenses/expenses-page-content").then(
      (mod) => mod.ExpensesPageContent
    ),
  { ssr: false }
);

const InvoicesPageContent = dynamic(
  () =>
    import("@/components/invoices/invoices-page-content").then(
      (mod) => mod.InvoicesPageContent
    ),
  { ssr: false }
);

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
