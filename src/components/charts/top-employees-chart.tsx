"use client";

import { useTranslations, useLocale } from "next-intl";
import { ChartCard } from "./chart-card";
import { TopEmployee } from "@/types";
import { Price } from "@/components/ui/price";

interface TopEmployeesChartProps {
  data: TopEmployee[];
}

export function TopEmployeesChart({ data }: TopEmployeesChartProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const maxRevenue = Math.max(...data.map((e) => e.revenue));

  return (
    <ChartCard title={t("topEmployees")}>
      <div className="space-y-4">
        {data.map((employee, index) => {
          const barWidth = (employee.revenue / maxRevenue) * 100;

          return (
            <div key={employee.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-xs font-english text-gold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <span className="text-sm font-english text-foreground">
                  <Price value={employee.revenue} />
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-gold-light transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
