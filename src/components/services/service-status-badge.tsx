"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ServiceStatus } from "@/types";

const statusStyles: Record<ServiceStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  inactive: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<ServiceStatus, string> = {
  active: "statusActive",
  inactive: "statusInactive",
};

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const t = useTranslations("services");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
