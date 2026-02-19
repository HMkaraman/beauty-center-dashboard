"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartDataPoint } from "@/types";
import { CHART_COLORS } from "@/constants/colors";
import { Price } from "@/components/ui/price";

interface EmployeesRevenueChartProps {
  data: ChartDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  const locale = useLocale();
  if (!active || !payload?.[0]) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-xs font-english text-foreground">
        <Price value={payload[0].value} />
      </p>
    </div>
  );
}

export function EmployeesRevenueChart({ data }: EmployeesRevenueChartProps) {
  const t = useTranslations("employees");

  return (
    <ChartCard title={t("topPerformers")}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={CHART_COLORS.gold}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
