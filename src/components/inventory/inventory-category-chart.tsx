"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslations } from "next-intl";
import { ChartCard } from "@/components/charts/chart-card";
import { DonutSegment } from "@/types";

interface InventoryCategoryChartProps {
  data: DonutSegment[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutSegment }>;
}) {
  if (!active || !payload?.[0]) return null;

  const segment = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs text-foreground">{segment.name}</p>
      <p className="text-xs font-english text-muted-foreground">
        {segment.value}
      </p>
    </div>
  );
}

export function InventoryCategoryChart({ data }: InventoryCategoryChartProps) {
  const t = useTranslations("inventory");
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const translatedData = data.map((d) => ({
    ...d,
    name: t(d.name.replace("inventory.", "")),
  }));

  return (
    <ChartCard title={t("byCategory")}>
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
              {total}
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
