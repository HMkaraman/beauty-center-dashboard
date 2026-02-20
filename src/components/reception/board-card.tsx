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
  canEdit?: boolean;
  showStatusSelect?: boolean;
}

export const statusActions: Record<string, { action: string; labelKey: string; color: string }> = {
  confirmed: { action: "waiting", labelKey: "clientArrived", color: "bg-amber-500 hover:bg-amber-600" },
  pending: { action: "waiting", labelKey: "clientArrived", color: "bg-amber-500 hover:bg-amber-600" },
  waiting: { action: "in-progress", labelKey: "startService", color: "bg-blue-500 hover:bg-blue-600" },
  "in-progress": { action: "completed", labelKey: "completeService", color: "bg-green-500 hover:bg-green-600" },
};

export function BoardCard({ appointment, onAction, className, canEdit, showStatusSelect }: BoardCardProps) {
  const t = useTranslations("reception");
  const actionInfo = statusActions[appointment.status];
  const showEdit = canEdit && appointment.status !== "completed";
  const showMoveSelect = showStatusSelect && appointment.status !== "completed";

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
        <div className="flex gap-2">
          <Button
            size="sm"
            className={`flex-1 text-white text-xs h-7 ${actionInfo.color}`}
            onClick={() => onAction(appointment.id, actionInfo.action)}
          >
            {t(actionInfo.labelKey)}
          </Button>
          {showEdit && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 shrink-0"
              onClick={() => onAction(appointment.id, "editAppointment")}
            >
              <Pencil className="h-3 w-3" />
              {t("editAppointment")}
            </Button>
          )}
        </div>
      )}

      {appointment.status === "completed" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-7"
            onClick={() => onAction(appointment.id, "editInvoice")}
          >
            <FileEdit className="h-3 w-3" />
            {t("editInvoice")}
          </Button>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 shrink-0"
              onClick={() => onAction(appointment.id, "editAppointment")}
            >
              <Pencil className="h-3 w-3" />
              {t("editAppointment")}
            </Button>
          )}
        </div>
      )}

      {showMoveSelect && (
        <StatusSelect
          currentStatus={appointment.status}
          onMove={(newStatus) => onAction(appointment.id, newStatus)}
        />
      )}
    </div>
  );
}
