"use client";

import { useLocale } from "next-intl";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * Hook that provides currency formatting based on current locale.
 * Reads from the settings store when no currency override is given.
 */
export function useCurrency(override?: string) {
  const locale = useLocale();
  const storeCurrency = useSettingsStore((s) => s.currency);
  const currency = override || storeCurrency || "SAR";

  return {
    format: (value: number | string) =>
      formatCurrency(value, currency, locale),
    symbol: getCurrencySymbol(currency, locale),
    currency,
    locale,
  };
}
