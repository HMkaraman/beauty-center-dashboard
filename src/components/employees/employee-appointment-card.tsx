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

interface EmployeeAppointmentCardProps {
  data: Appointment;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  onDelete?: (id: string) => void;
}

export function EmployeeAppointmentCard({ data, onStatusChange, onDelete }: EmployeeAppointmentCardProps) {
  const t = useTranslations("employees");
  const ta = useTranslations("appointments");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.service}</p>
          <p className="text-xs text-muted-foreground">{data.clientName}</p>
        </div>
        <div className="flex items-center gap-1">
          <AppointmentStatusBadge status={data.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/appointments/${data.id}`)}>{ta("view")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/appointments/${data.id}/edit`)}>{ta("edit")}</DropdownMenuItem>
              {onStatusChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>{ta("status")}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {STATUSES.filter((s) => s !== data.status).map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onStatusChange(data.id, status)}>
                        {ta(STATUS_KEYS[status] as "statusConfirmed")}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{ta("delete")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
