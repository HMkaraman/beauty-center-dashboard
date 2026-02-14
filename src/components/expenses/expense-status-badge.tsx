"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { ExpenseStatus } from "@/types";

const statusStyles: Record<ExpenseStatus, string> = {
  approved: "border-green-500/30 bg-green-500/10 text-green-400",
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
};

const statusKeys: Record<ExpenseStatus, string> = {
  approved: "statusApproved",
  pending: "statusPending",
  rejected: "statusRejected",
};

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus;
}

export function ExpenseStatusBadge({ status }: ExpenseStatusBadgeProps) {
  const t = useTranslations("expenses");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
