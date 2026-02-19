interface CurrencyConfig {
  code: string;
  symbol: string;
  symbolAr: string;
  decimals: number;
  locale: string;
  localeAr: string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  SAR: {
    code: "SAR",
    symbol: "SAR",
    symbolAr: "\u0631.\u0633",
    decimals: 2,
    locale: "en-SA",
    localeAr: "ar-SA",
  },
  AED: {
    code: "AED",
    symbol: "AED",
    symbolAr: "\u062F.\u0625",
    decimals: 2,
    locale: "en-AE",
    localeAr: "ar-AE",
  },
  IQD: {
    code: "IQD",
    symbol: "IQD",
    symbolAr: "\u062F.\u0639",
    decimals: 0, // Iraqi Dinar uses no decimals
    locale: "en-IQ",
    localeAr: "ar-IQ",
  },
};

/**
 * Format a number as currency.
 * @param value - The numeric value
 * @param currency - Currency code (SAR, AED, IQD)
 * @param locale - Display locale ("ar" or "en")
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | string,
  currency: string = "SAR",
  locale: string = "ar"
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  const config = CURRENCIES[currency] || CURRENCIES.SAR;
  const displayLocale = locale === "ar" ? config.localeAr : config.locale;

  try {
    return new Intl.NumberFormat(displayLocale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
      numberingSystem: "latn",
    }).format(num);
  } catch {
    // Fallback if Intl doesn't support the currency
    const symbol = locale === "ar" ? config.symbolAr : config.symbol;
    const formatted = num.toFixed(config.decimals);
    return locale === "ar"
      ? `${formatted} ${symbol}`
      : `${symbol} ${formatted}`;
  }
}

/**
 * Get currency symbol for a currency code.
 */
export function getCurrencySymbol(
  currency: string,
  locale: string = "ar"
): string {
  const config = CURRENCIES[currency] || CURRENCIES.SAR;
  return locale === "ar" ? config.symbolAr : config.symbol;
}

/**
 * Get the number of decimal places for a currency.
 */
export function getCurrencyDecimals(currency: string): number {
  return CURRENCIES[currency]?.decimals ?? 2;
}

/**
 * Get all supported currencies for dropdown selectors.
 */
export function getSupportedCurrencies(): Array<{
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  symbolAr: string;
}> {
  return [
    {
      code: "SAR",
      name: "Saudi Riyal",
      nameAr: "\u0631\u064A\u0627\u0644 \u0633\u0639\u0648\u062F\u064A",
      symbol: "SAR",
      symbolAr: "\u0631.\u0633",
    },
    {
      code: "AED",
      name: "UAE Dirham",
      nameAr: "\u062F\u0631\u0647\u0645 \u0625\u0645\u0627\u0631\u0627\u062A\u064A",
      symbol: "AED",
      symbolAr: "\u062F.\u0625",
    },
    {
      code: "IQD",
      name: "Iraqi Dinar",
      nameAr: "\u062F\u064A\u0646\u0627\u0631 \u0639\u0631\u0627\u0642\u064A",
      symbol: "IQD",
      symbolAr: "\u062F.\u0639",
    },
  ];
}
