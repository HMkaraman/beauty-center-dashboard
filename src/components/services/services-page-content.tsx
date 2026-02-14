"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { ServicesCategoryChart } from "./services-category-chart";
import { ServicesBookingsChart } from "./services-bookings-chart";
import { ServicesTable } from "./services-table";
import { ServiceCard } from "./service-card";
import { NewServiceSheet } from "./new-service-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  servicesKpiData,
  servicesByCategoryData,
  servicesBookingsTrendData,
  servicesListData,
} from "@/lib/mock-data";

export function ServicesPageContent() {
  const t = useTranslations("services");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {servicesKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ServicesCategoryChart data={servicesByCategoryData} />
        <ServicesBookingsChart data={servicesBookingsTrendData} />
      </div>

      {/* Services List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("servicesList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newService")}
          </Button>
        </div>

        <ServicesTable data={servicesListData} />

        <div className="space-y-3 md:hidden">
          {servicesListData.map((service) => (
            <ServiceCard key={service.id} data={service} />
          ))}
        </div>
      </div>

      <NewServiceSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
