"use client";

import { useTranslations, useLocale } from "next-intl";
import { Price } from "./price";
import { formatNumber, formatPercentage } from "@/lib/formatters";
import { MiniKPIData } from "@/types";

interface MiniKPICardProps {
  data: MiniKPIData;
}

export function MiniKPICard({ data }: MiniKPICardProps) {
  const t = useTranslations();
  const locale = useLocale();

  let content: React.ReactNode;
  switch (data.format) {
    case "currency":
      content = <Price value={data.value as number} />;
      break;
    case "percentage":
      content = formatPercentage(data.value as number);
      break;
    case "number":
      content = formatNumber(data.value as number, locale);
      break;
    default:
      content = String(data.value);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{t(data.label)}</p>
      <p className="mt-1 text-lg font-semibold font-english text-foreground">
        {content}
      </p>
    </div>
  );
}
