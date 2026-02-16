"use client";

import { useTranslations, useLocale } from "next-intl";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment } from "@/types";

interface DoctorAppointmentCardProps {
  data: Appointment;
}

export function DoctorAppointmentCard({ data }: DoctorAppointmentCardProps) {
  const t = useTranslations("doctors");
  const locale = useLocale();

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.service}</p>
          <p className="text-xs text-muted-foreground">{data.clientName}</p>
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
        <p className="text-sm font-bold font-english text-foreground">{formatCurrency(data.price, locale)}</p>
      </div>
    </div>
  );
}
