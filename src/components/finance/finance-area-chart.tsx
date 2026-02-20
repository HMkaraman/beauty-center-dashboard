"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartDataPoint } from "@/types";
import { useChartColors } from "@/lib/hooks/use-chart-colors";
import { formatCompactNumber } from "@/lib/formatters";
import { useTranslatedChartData } from "@/hooks/useTranslatedChartData";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  const t = useTranslations("finance");

  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs font-english" style={{ color: entry.color }}>
          {entry.name === "revenue" ? t("revenue") : t("expenses")}:{" "}
          {formatCompactNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function FinanceAreaChart({ data }: { data: ChartDataPoint[] }) {
  const t = useTranslations("finance");
  const translatedData = useTranslatedChartData(data);
  const CHART_COLORS = useChartColors();

  return (
    <ChartCard title={t("revenueVsExpenses")}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={translatedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="financeGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.border}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.gold}
              strokeWidth={2}
              fill="url(#financeGoldGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={CHART_COLORS.red}
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
