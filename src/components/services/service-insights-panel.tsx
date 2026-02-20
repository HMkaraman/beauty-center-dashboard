"use client";

import { useTranslations } from "next-intl";
import { ServiceAnalytics } from "@/types";
import { Price } from "@/components/ui/price";

interface ServiceInsightsPanelProps {
  analytics: ServiceAnalytics;
}

export function ServiceInsightsPanel({ analytics }: ServiceInsightsPanelProps) {
  const t = useTranslations("services");

  const maxRevenue = Math.max(...analytics.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Top Employees */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("topEmployees")}</h3>
        {analytics.topEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noDataYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.topEmployees.map((emp, i) => (
              <div key={emp.employeeName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{emp.employeeName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {emp.count} {t("times")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Clients */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("topClients")}</h3>
        {analytics.topClients.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noDataYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.topClients.map((client, i) => (
              <div key={client.clientName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{client.clientName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {client.count} {t("times")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Revenue Trend */}
      <div className="rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("revenueTrend")}</h3>
        <div className="flex items-end gap-2 h-24">
          {analytics.monthlyRevenue.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-english text-muted-foreground truncate max-w-full">
                <Price value={month.revenue} />
              </span>
              <div
                className="w-full rounded-t bg-gold/70 transition-all min-h-[2px]"
                style={{
                  height: `${month.revenue > 0 ? (month.revenue / maxRevenue) * 100 : 2}%`,
                }}
              />
              <span className="text-[10px] font-english text-muted-foreground/60">
                {month.month.split("-")[1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
