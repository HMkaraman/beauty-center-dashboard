"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ClientStatus } from "@/types";

const statusStyles: Record<ClientStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  inactive: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<ClientStatus, string> = {
  active: "statusActive",
  inactive: "statusInactive",
};

interface ClientStatusBadgeProps {
  status: ClientStatus;
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const t = useTranslations("clients");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
