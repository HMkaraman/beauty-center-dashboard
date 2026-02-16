"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartDataPoint } from "@/types";
import { CHART_COLORS } from "@/constants/colors";
import { formatNumber } from "@/lib/formatters";
import { useTranslatedChartData } from "@/hooks/useTranslatedChartData";

interface MarketingReachChartProps {
  data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const locale = useLocale();
  if (!active || !payload?.[0]) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-xs font-english text-foreground">{formatNumber(payload[0].value, locale)}</p>
    </div>
  );
}

export function MarketingReachChart({ data }: MarketingReachChartProps) {
  const t = useTranslations("marketing");
  const translatedData = useTranslatedChartData(data);

  return (
    <ChartCard title={t("reachTrend")}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={translatedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: CHART_COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="value" stroke={CHART_COLORS.gold} strokeWidth={2.5} dot={{ fill: CHART_COLORS.gold, r: 4, strokeWidth: 0 }} activeDot={{ fill: CHART_COLORS.gold, r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
