"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { TransactionType } from "@/types";

const typeStyles: Record<TransactionType, string> = {
  income: "border-green-500/30 bg-green-500/10 text-green-400",
  expense: "border-red-500/30 bg-red-500/10 text-red-400",
};

const typeKeys: Record<TransactionType, string> = {
  income: "typeIncome",
  expense: "typeExpense",
};

interface TransactionTypeBadgeProps {
  type: TransactionType;
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const t = useTranslations("finance");

  return (
    <Badge variant="outline" className={typeStyles[type]}>
      {t(typeKeys[type])}
    </Badge>
  );
}
