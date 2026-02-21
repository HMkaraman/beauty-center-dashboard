"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { ChartCard } from "@/components/charts/chart-card";
import { DonutSegment } from "@/types";
import { formatCompactNumber } from "@/lib/formatters";
import { Price } from "@/components/ui/price";

interface FinanceRevenueChartProps {
  data: DonutSegment[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutSegment }>;
}) {
  const locale = useLocale();
  if (!active || !payload?.[0]) return null;

  const segment = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs text-foreground">{segment.name}</p>
      <p className="text-xs font-english text-muted-foreground">
        <Price value={segment.value} />
      </p>
    </div>
  );
}

export function FinanceRevenueChart({ data }: FinanceRevenueChartProps) {
  const t = useTranslations("finance");
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const translatedData = data.map((d) => {
    // Only translate names that look like i18n keys (ASCII, e.g. "catSkincare")
    // DB service names (often Arabic) are used as-is
    const key = d.name.replace("finance.", "");
    let name: string;
    if (/^[a-zA-Z][\w.]*$/.test(key)) {
      try {
        const translated = t(key);
        name = translated !== key ? translated : d.name;
      } catch {
        name = d.name;
      }
    } else {
      name = d.name;
    }
    return { ...d, name };
  });

  return (
    <ChartCard title={t("revenueByCategory")}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                strokeWidth={0}
              >
                {translatedData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="text-sm font-bold font-english text-foreground">
              {formatCompactNumber(total)}
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {translatedData.map((segment) => {
            const percentage = ((segment.value / total) * 100).toFixed(0);
            return (
              <div key={segment.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-muted-foreground">{segment.name}</span>
                </div>
                <span className="font-english text-foreground">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}
