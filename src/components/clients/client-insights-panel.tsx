"use client";

import { useTranslations } from "next-intl";
import { ClientAnalytics } from "@/types";

interface ClientInsightsPanelProps {
  analytics: ClientAnalytics;
}

export function ClientInsightsPanel({ analytics }: ClientInsightsPanelProps) {
  const t = useTranslations("clients");

  const maxVisits = Math.max(...analytics.monthlyVisits.map((m) => m.count), 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Favorite Services */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("favoriteServices")}</h3>
        {analytics.favoriteServices.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noVisitsYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.favoriteServices.map((service, i) => (
              <div key={service.serviceName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{service.serviceName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {service.count} {t("visits")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Employees */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("preferredEmployees")}</h3>
        {analytics.preferredEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noVisitsYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.preferredEmployees.map((emp, i) => (
              <div key={emp.employeeName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{emp.employeeName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {emp.count} {t("visits")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Visit Trend */}
      <div className="rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("visitTrend")}</h3>
        <div className="flex items-end gap-2 h-24">
          {analytics.monthlyVisits.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-english text-muted-foreground">{month.count}</span>
              <div
                className="w-full rounded-t bg-gold/70 transition-all min-h-[2px]"
                style={{
                  height: `${month.count > 0 ? (month.count / maxVisits) * 100 : 2}%`,
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
