"use client";

import { useTranslations } from "next-intl";
import { DoctorAnalytics } from "@/types";

interface DoctorInsightsPanelProps {
  analytics: DoctorAnalytics;
}

export function DoctorInsightsPanel({ analytics }: DoctorInsightsPanelProps) {
  const t = useTranslations("doctors");

  const maxConsultations = Math.max(...analytics.monthlyConsultations.map((m) => m.count), 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Top Procedures */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("topProcedures")}</h3>
        {analytics.topProcedures.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noDataYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.topProcedures.map((procedure, i) => (
              <div key={procedure.serviceName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{procedure.serviceName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {procedure.count} {t("times")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Patients */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("topPatients")}</h3>
        {analytics.topPatients.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noDataYet")}</p>
        ) : (
          <div className="space-y-3">
            {analytics.topPatients.map((patient, i) => (
              <div key={patient.clientName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{patient.clientName}</span>
                </div>
                <span className="text-xs font-english text-muted-foreground">
                  {patient.count} {t("times")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Consultations Trend */}
      <div className="rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{t("consultationsTrendDetail")}</h3>
        <div className="flex items-end gap-2 h-24">
          {analytics.monthlyConsultations.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-english text-muted-foreground">{month.count}</span>
              <div
                className="w-full rounded-t bg-gold/70 transition-all min-h-[2px]"
                style={{
                  height: `${month.count > 0 ? (month.count / maxConsultations) * 100 : 2}%`,
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
