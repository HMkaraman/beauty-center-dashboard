"use client";

import { useTranslations } from "next-intl";
import { Clock, User, Stethoscope, FileEdit, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusSelect } from "./status-select";
import { Appointment } from "@/types";

interface BoardCardProps {
  appointment: Appointment;
  onAction: (id: string, action: string) => void;
  className?: string;
  showMobileActions?: boolean;
}

const statusActions: Record<string, { action: string; labelKey: string; color: string }> = {
  confirmed: { action: "waiting", labelKey: "clientArrived", color: "bg-amber-500 hover:bg-amber-600" },
  pending: { action: "waiting", labelKey: "clientArrived", color: "bg-amber-500 hover:bg-amber-600" },
  waiting: { action: "in-progress", labelKey: "startService", color: "bg-blue-500 hover:bg-blue-600" },
  "in-progress": { action: "completed", labelKey: "completeService", color: "bg-green-500 hover:bg-green-600" },
};

export function BoardCard({ appointment, onAction, className, showMobileActions }: BoardCardProps) {
  const t = useTranslations("reception");
  const actionInfo = statusActions[appointment.status];

  return (
    <div className={`rounded-lg border border-border bg-card p-3 space-y-2 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm text-foreground truncate">
          {appointment.clientName}
        </p>
        <span className="text-xs font-english text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {appointment.time}
        </span>
      </div>

      <p className="text-xs text-muted-foreground truncate">
        {appointment.service}
      </p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {appointment.employee && (
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" />
            {appointment.employee}
          </span>
        )}
        {appointment.doctor && (
          <span className="flex items-center gap-1 truncate">
            <Stethoscope className="h-3 w-3 shrink-0" />
            {appointment.doctor}
          </span>
        )}
      </div>

      {actionInfo && (
        <Button
          size="sm"
          className={`w-full text-white text-xs h-7 ${actionInfo.color}`}
          onClick={() => onAction(appointment.id, actionInfo.action)}
        >
          {t(actionInfo.labelKey)}
        </Button>
      )}

      {appointment.status === "completed" && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          onClick={() => onAction(appointment.id, "editInvoice")}
        >
          <FileEdit className="h-3 w-3" />
          {t("editInvoice")}
        </Button>
      )}

      {showMobileActions && (
        <div className="flex gap-2">
          {appointment.status !== "completed" && (
            <div className="flex-1">
              <StatusSelect
                currentStatus={appointment.status}
                onMove={(newStatus) => onAction(appointment.id, newStatus)}
              />
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 shrink-0"
            onClick={() => onAction(appointment.id, "editAppointment")}
          >
            <Pencil className="h-3 w-3" />
            {t("editAppointment")}
          </Button>
        </div>
      )}
    </div>
  );
}
