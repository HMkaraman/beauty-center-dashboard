"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { InventoryStatus } from "@/types";

const statusStyles: Record<InventoryStatus, string> = {
  "in-stock": "border-green-500/30 bg-green-500/10 text-green-400",
  "low-stock": "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "out-of-stock": "border-red-500/30 bg-red-500/10 text-red-400",
};

const statusKeys: Record<InventoryStatus, string> = {
  "in-stock": "statusInStock",
  "low-stock": "statusLowStock",
  "out-of-stock": "statusOutOfStock",
};

interface InventoryStatusBadgeProps {
  status: InventoryStatus;
}

export function InventoryStatusBadge({ status }: InventoryStatusBadgeProps) {
  const t = useTranslations("inventory");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
