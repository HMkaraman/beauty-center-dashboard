"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Clock, CalendarDays, Users, Activity, DollarSign, CalendarSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReceptionStats } from "@/lib/hooks/use-reception";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";

interface ReceptionHeaderProps {
  onCheckAvailability?: () => void;
}

export function ReceptionHeader({ onCheckAvailability }: ReceptionHeaderProps) {
  const t = useTranslations("reception");
  const locale = useLocale();
  const { data: stats } = useReceptionStats();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [locale]);

  return (
    <header className="border-b border-border bg-card px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              {t("backToDashboard")}
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-english tabular-nums">{time}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats pills */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-english">{stats?.totalAppointments ?? 0}</span>
              <span className="text-muted-foreground">{t("total")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-600">
              <Users className="h-3.5 w-3.5" />
              <span className="font-english">{stats?.waiting ?? 0}</span>
              <span>{t("waiting")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-600">
              <Activity className="h-3.5 w-3.5" />
              <span className="font-english">{stats?.inProgress ?? 0}</span>
              <span>{t("inProgress")}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-600">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="font-english">{formatCurrency(stats?.todayRevenue ?? 0, locale)}</span>
            </div>
          </div>

          {/* Check Availability button */}
          {onCheckAvailability && (
            <Button variant="outline" size="sm" onClick={onCheckAvailability}>
              <CalendarSearch className="h-4 w-4" />
              <span className="hidden sm:inline">{t("checkAvailability")}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
