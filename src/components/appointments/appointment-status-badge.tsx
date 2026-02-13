"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types";

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "border-green-500/30 bg-green-500/10 text-green-400",
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
  completed: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  "no-show": "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<AppointmentStatus, string> = {
  confirmed: "statusConfirmed",
  pending: "statusPending",
  cancelled: "statusCancelled",
  completed: "statusCompleted",
  "no-show": "statusNoShow",
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const t = useTranslations("appointments");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
