"use client";

import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import { ProfitabilityData } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface ProfitabilityBannerProps {
  data: ProfitabilityData;
}

export function ProfitabilityBanner({ data }: ProfitabilityBannerProps) {
  const t = useTranslations("dashboard");
  const isHealthy = data.margin > 25;

  return (
    <div
      className={`rounded-lg border border-border p-5 ${
        isHealthy
          ? "bg-gradient-to-l from-green/10 to-card"
          : "bg-gradient-to-l from-red/10 to-card"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isHealthy ? "bg-green/15" : "bg-red/15"
            }`}
          >
            <TrendingUp className={`h-5 w-5 ${isHealthy ? "text-green" : "text-red"}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("profitability")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("profitMargin")}: {formatPercentage(data.margin)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("revenue")}</p>
            <p className="text-sm font-bold font-english text-foreground">
              {formatCurrency(data.revenue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("expenses")}</p>
            <p className="text-sm font-bold font-english text-red">
              {formatCurrency(data.expenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("netProfit")}</p>
            <p className="text-sm font-bold font-english text-green">
              {formatCurrency(data.profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
