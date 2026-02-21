"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Appointment, AppointmentStatus } from "@/types";
import { Price } from "@/components/ui/price";

const STATUSES: AppointmentStatus[] = ["confirmed", "pending", "waiting", "in-progress", "cancelled", "completed", "no-show"];

const STATUS_KEYS: Record<AppointmentStatus, string> = {
  confirmed: "statusConfirmed",
  pending: "statusPending",
  cancelled: "statusCancelled",
  completed: "statusCompleted",
  "no-show": "statusNoShow",
  waiting: "statusWaiting",
  "in-progress": "statusInProgress",
};

interface ClientDetailAppointmentsTableProps {
  data: Appointment[];
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onDelete?: (id: string) => void;
}

export function ClientDetailAppointmentsTable({ data, onStatusChange, onDelete }: ClientDetailAppointmentsTableProps) {
  const t = useTranslations("clients");
  const ta = useTranslations("appointments");
  const locale = useLocale();
  const router = useRouter();

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
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{ta("actions")}</th>
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
              <td className="px-4 py-3 font-english text-foreground"><Price value={appointment.price} /></td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}`)}>{ta("view")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/appointments/${appointment.id}/edit`)}>{ta("edit")}</DropdownMenuItem>
                    {onStatusChange && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>{ta("status")}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {STATUSES.filter((s) => s !== appointment.status).map((status) => (
                            <DropdownMenuItem key={status} onClick={() => onStatusChange(appointment.id, status)}>
                              {ta(STATUS_KEYS[status] as "statusConfirmed")}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(appointment.id)}>{ta("delete")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
