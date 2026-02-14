"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { MarketingChannelChart } from "./marketing-channel-chart";
import { MarketingReachChart } from "./marketing-reach-chart";
import { MarketingTable } from "./marketing-table";
import { CampaignCard } from "./campaign-card";
import { NewCampaignSheet } from "./new-campaign-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  marketingKpiData,
  marketingByChannelData,
  marketingReachTrendData,
  marketingCampaignsData,
} from "@/lib/mock-data";

export function MarketingPageContent() {
  const t = useTranslations("marketing");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {marketingKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketingChannelChart data={marketingByChannelData} />
        <MarketingReachChart data={marketingReachTrendData} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("campaignsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newCampaign")}
          </Button>
        </div>

        <MarketingTable data={marketingCampaignsData} />

        <div className="space-y-3 md:hidden">
          {marketingCampaignsData.map((campaign) => (
            <CampaignCard key={campaign.id} data={campaign} />
          ))}
        </div>
      </div>

      <NewCampaignSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
