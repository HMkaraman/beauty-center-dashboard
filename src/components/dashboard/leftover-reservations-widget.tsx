"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Syringe, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservationsDashboard } from "@/lib/hooks/use-reservations";

export function LeftoverReservationsWidget() {
  const t = useTranslations("reservations");
  const router = useRouter();
  const { data, isLoading } = useReservationsDashboard();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!data || data.activeCount === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("dashboardWidgetTitle")}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/reservations")}>
          {t("viewAll")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-english text-foreground">{data.activeCount}</p>
          <p className="text-xs text-muted-foreground">{t("statusActive")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-english text-amber-600">{data.expiringSoonCount}</p>
          <p className="text-xs text-muted-foreground">{t("expiringSoon")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-english text-red-600">{data.monthlyExpiredCount}</p>
          <p className="text-xs text-muted-foreground">{t("expiredThisMonth")}</p>
        </div>
      </div>

      {/* Expiring Soon List */}
      {data.expiringSoonList.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expiringSoon")}</p>
          {data.expiringSoonList.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate">{item.clientName}</span>
                <span className="text-muted-foreground truncate">{item.productName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-english text-xs">{item.remainingAmount} {item.unit}</span>
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock className="h-3 w-3" />
                  {item.daysLeft}d
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
