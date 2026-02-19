"use client";

import { useTranslations, useLocale } from "next-intl";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Appointment } from "@/types";
import { Price } from "@/components/ui/price";

interface ClientAppointmentCardProps {
  data: Appointment;
}

export function ClientAppointmentCard({ data }: ClientAppointmentCardProps) {
  const t = useTranslations("clients");
  const locale = useLocale();

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.service}</p>
          <p className="text-xs text-muted-foreground">{data.employee}</p>
        </div>
        <AppointmentStatusBadge status={data.status} />
      </div>
      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("date")}: <span className="font-english">{data.date}</span></span>
          <span>{t("time")}: <span className="font-english">{data.time}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("durationMin")}: <span className="font-english">{data.duration}{t("minutes")}</span></span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end border-t border-border pt-3">
        <p className="text-sm font-bold font-english text-foreground"><Price value={data.price} /></p>
      </div>
    </div>
  );
}
