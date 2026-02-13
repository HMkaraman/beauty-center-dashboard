"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { ClientsStatusChart } from "./clients-status-chart";
import { ClientsGrowthChart } from "./clients-growth-chart";
import { ClientsTable } from "./clients-table";
import { ClientCard } from "./client-card";
import { NewClientSheet } from "./new-client-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  clientsKpiData,
  clientsByStatusData,
  clientsGrowthData,
  clientsListData,
} from "@/lib/mock-data";

export function ClientsPageContent() {
  const t = useTranslations("clients");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {clientsKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ClientsStatusChart data={clientsByStatusData} />
        <ClientsGrowthChart data={clientsGrowthData} />
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("clientsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newClient")}
          </Button>
        </div>

        <ClientsTable data={clientsListData} />

        <div className="space-y-3 md:hidden">
          {clientsListData.map((client) => (
            <ClientCard key={client.id} data={client} />
          ))}
        </div>
      </div>

      <NewClientSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
