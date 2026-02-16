"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/types";

const statusStyles: Record<InvoiceStatus, string> = {
  paid: "border-green-500/30 bg-green-500/10 text-green-400",
  unpaid: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  void: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

const statusKeys: Record<InvoiceStatus, string> = {
  paid: "statusPaid",
  unpaid: "statusUnpaid",
  void: "statusVoid",
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const t = useTranslations("invoices");

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {t(statusKeys[status])}
    </Badge>
  );
}
