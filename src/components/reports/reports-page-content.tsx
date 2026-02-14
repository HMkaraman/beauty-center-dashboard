"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { ReportsTypeChart } from "./reports-type-chart";
import { ReportsDownloadsChart } from "./reports-downloads-chart";
import { ReportCard } from "./report-card";
import { NewReportSheet } from "./new-report-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  reportsKpiData,
  reportsByTypeData,
  reportsDownloadsTrendData,
  reportsListData,
} from "@/lib/mock-data";

export function ReportsPageContent() {
  const t = useTranslations("reports");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {reportsKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportsTypeChart data={reportsByTypeData} />
        <ReportsDownloadsChart data={reportsDownloadsTrendData} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("reportsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newReport")}
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {reportsListData.map((report) => (
            <ReportCard key={report.id} data={report} />
          ))}
        </div>
      </div>

      <NewReportSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
