"use client";

import { useTranslations, useLocale } from "next-intl";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Appointment } from "@/types";

interface ClientDetailAppointmentsTableProps {
  data: Appointment[];
}

export function ClientDetailAppointmentsTable({ data }: ClientDetailAppointmentsTableProps) {
  const t = useTranslations("clients");
  const locale = useLocale();

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        {t("noAppointments")}
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("time")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("service")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("employee")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("durationMin")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("price")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((appointment) => (
            <tr key={appointment.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.date}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.time}</td>
              <td className="px-4 py-3 text-foreground">{appointment.service}</td>
              <td className="px-4 py-3 text-muted-foreground">{appointment.employee}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{appointment.duration}{t("minutes")}</td>
              <td className="px-4 py-3"><AppointmentStatusBadge status={appointment.status} /></td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(appointment.price, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
