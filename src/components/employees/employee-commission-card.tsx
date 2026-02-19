"use client";

import { useTranslations, useLocale } from "next-intl";
import { EmployeeCommission } from "@/types";
import { Price } from "@/components/ui/price";

interface EmployeeCommissionCardProps {
  data: EmployeeCommission;
}

export function EmployeeCommissionCard({ data }: EmployeeCommissionCardProps) {
  const t = useTranslations("employees");
  const locale = useLocale();

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.clientName || "—"}</p>
          <p className="text-xs font-english text-muted-foreground">{data.date}</p>
        </div>
        <span className="text-xs font-english text-muted-foreground">{data.rate}%</span>
      </div>
      <div className="mt-3 flex items-center justify-end border-t border-border pt-3">
        <p className="text-sm font-bold font-english text-foreground"><Price value={data.amount} /></p>
      </div>
    </div>
  );
}
