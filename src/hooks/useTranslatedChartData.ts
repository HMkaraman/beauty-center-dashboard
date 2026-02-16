import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChartDataPoint } from "@/types";

export function useTranslatedChartData(data: ChartDataPoint[]): ChartDataPoint[] {
  const t = useTranslations();

  return useMemo(
    () =>
      data.map((point) => ({
        ...point,
        name: point.name.startsWith("common.") ? t(point.name) : point.name,
      })),
    [data, t]
  );
}
