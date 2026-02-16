"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";
import { MiniKPIData } from "@/types";

interface MiniKPICardProps {
  data: MiniKPIData;
}

export function MiniKPICard({ data }: MiniKPICardProps) {
  const t = useTranslations();
  const locale = useLocale();

  let formattedValue: string;
  switch (data.format) {
    case "currency":
      formattedValue = formatCurrency(data.value as number, locale);
      break;
    case "percentage":
      formattedValue = formatPercentage(data.value as number);
      break;
    case "number":
      formattedValue = formatNumber(data.value as number, locale);
      break;
    default:
      formattedValue = String(data.value);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{t(data.label)}</p>
      <p className="mt-1 text-lg font-semibold font-english text-foreground">
        {formattedValue}
      </p>
    </div>
  );
}
