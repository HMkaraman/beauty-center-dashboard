"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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

const FinanceReportsTab = dynamic(
  () =>
    import("./finance-reports-tab").then((mod) => mod.FinanceReportsTab),
  { ssr: false }
);

const FinanceAccountsTab = dynamic(
  () =>
    import("./finance-accounts-tab").then((mod) => mod.FinanceAccountsTab),
  { ssr: false }
);

export function FinancePageContent() {
  const t = useTranslations("finance");
  const searchParams = useSearchParams();
  const hasNewInvoice = searchParams.get("newInvoice") === "true";

  return (
    <Tabs defaultValue={hasNewInvoice ? "invoices" : "overview"}>
      <TabsList>
        <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
        <TabsTrigger value="transactions">{t("tabs.transactions")}</TabsTrigger>
        <TabsTrigger value="expenses">{t("tabs.expenses")}</TabsTrigger>
        <TabsTrigger value="invoices">{t("tabs.invoices")}</TabsTrigger>
        <TabsTrigger value="reports">{t("reports.title")}</TabsTrigger>
        <TabsTrigger value="accounts">{t("accounts.title")}</TabsTrigger>
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

      <TabsContent value="reports">
        <FinanceReportsTab />
      </TabsContent>

      <TabsContent value="accounts">
        <FinanceAccountsTab />
      </TabsContent>
    </Tabs>
  );
}
