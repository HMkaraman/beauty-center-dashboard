import { formatCurrency as formatDetailed } from "@/lib/currency";
import { useSettingsStore } from "@/store/useSettingsStore";

export function formatCurrency(value: number, locale: string = "ar", currency?: string): string {
  const resolved = currency || useSettingsStore.getState().currency || "SAR";
  return formatDetailed(value, resolved, locale);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}

export function formatNumber(value: number, locale: string = "ar"): string {
  const intlLocale = locale === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(intlLocale, { numberingSystem: "latn" }).format(value);
}
