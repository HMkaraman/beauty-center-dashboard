"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { EmployeeStatus } from "@/types";

const statusStyles: Record<EmployeeStatus, string> = {
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  "on-leave": "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  inactive: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<EmployeeStatus, string> = {
  active: "statusActive",
  "on-leave": "statusOnLeave",
  inactive: "statusInactive",
};

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
}

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const t = useTranslations("employees");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
