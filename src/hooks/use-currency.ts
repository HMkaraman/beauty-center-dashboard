"use client";

import { useLocale } from "next-intl";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

/**
 * Hook that provides currency formatting based on current locale.
 * The currency code should come from the tenant settings.
 */
export function useCurrency(currency: string = "SAR") {
  const locale = useLocale();

  return {
    format: (value: number | string) =>
      formatCurrency(value, currency, locale),
    symbol: getCurrencySymbol(currency, locale),
    currency,
    locale,
  };
}
