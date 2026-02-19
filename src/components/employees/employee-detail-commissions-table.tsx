"use client";

import { useTranslations, useLocale } from "next-intl";
import { EmployeeCommission } from "@/types";
import { Price } from "@/components/ui/price";

interface EmployeeDetailCommissionsTableProps {
  data: EmployeeCommission[];
}

export function EmployeeDetailCommissionsTable({ data }: EmployeeDetailCommissionsTableProps) {
  const t = useTranslations("employees");
  const locale = useLocale();

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        {t("noCommissions")}
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("date")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("client")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("commissionRate")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("commissionAmount")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((commission) => (
            <tr key={commission.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-english text-muted-foreground">{commission.date}</td>
              <td className="px-4 py-3 text-foreground">{commission.clientName || "—"}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{commission.rate}%</td>
              <td className="px-4 py-3 font-english text-foreground"><Price value={commission.amount} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
