interface CurrencyConfig {
  code: string;
  symbol: string;
  symbolAr: string;
  name: string;
  nameAr: string;
  decimals: number;
  locale: string;
  localeAr: string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  SAR: { code: "SAR", symbol: "SAR", symbolAr: "ر.س", name: "Saudi Riyal", nameAr: "ريال سعودي", decimals: 2, locale: "en-SA", localeAr: "ar-SA" },
  AED: { code: "AED", symbol: "AED", symbolAr: "د.إ", name: "UAE Dirham", nameAr: "درهم إماراتي", decimals: 2, locale: "en-AE", localeAr: "ar-AE" },
  BHD: { code: "BHD", symbol: "BD", symbolAr: "د.ب", name: "Bahraini Dinar", nameAr: "دينار بحريني", decimals: 3, locale: "en-BH", localeAr: "ar-BH" },
  OMR: { code: "OMR", symbol: "OMR", symbolAr: "ر.ع", name: "Omani Rial", nameAr: "ريال عماني", decimals: 3, locale: "en-OM", localeAr: "ar-OM" },
  KWD: { code: "KWD", symbol: "KD", symbolAr: "د.ك", name: "Kuwaiti Dinar", nameAr: "دينار كويتي", decimals: 3, locale: "en-KW", localeAr: "ar-KW" },
  QAR: { code: "QAR", symbol: "QR", symbolAr: "ر.ق", name: "Qatari Riyal", nameAr: "ريال قطري", decimals: 2, locale: "en-QA", localeAr: "ar-QA" },
  IQD: { code: "IQD", symbol: "IQD", symbolAr: "د.ع", name: "Iraqi Dinar", nameAr: "دينار عراقي", decimals: 0, locale: "en-IQ", localeAr: "ar-IQ" },
  JOD: { code: "JOD", symbol: "JD", symbolAr: "د.أ", name: "Jordanian Dinar", nameAr: "دينار أردني", decimals: 3, locale: "en-JO", localeAr: "ar-JO" },
  EGP: { code: "EGP", symbol: "E£", symbolAr: "ج.م", name: "Egyptian Pound", nameAr: "جنيه مصري", decimals: 2, locale: "en-EG", localeAr: "ar-EG" },
  LBP: { code: "LBP", symbol: "L£", symbolAr: "ل.ل", name: "Lebanese Pound", nameAr: "ليرة لبنانية", decimals: 0, locale: "en-LB", localeAr: "ar-LB" },
  TRY: { code: "TRY", symbol: "₺", symbolAr: "₺", name: "Turkish Lira", nameAr: "ليرة تركية", decimals: 2, locale: "tr-TR", localeAr: "ar-TR" },
  MAD: { code: "MAD", symbol: "MAD", symbolAr: "د.م", name: "Moroccan Dirham", nameAr: "درهم مغربي", decimals: 2, locale: "fr-MA", localeAr: "ar-MA" },
  TND: { code: "TND", symbol: "DT", symbolAr: "د.ت", name: "Tunisian Dinar", nameAr: "دينار تونسي", decimals: 3, locale: "fr-TN", localeAr: "ar-TN" },
  USD: { code: "USD", symbol: "$", symbolAr: "$", name: "US Dollar", nameAr: "دولار أمريكي", decimals: 2, locale: "en-US", localeAr: "ar-US" },
  EUR: { code: "EUR", symbol: "€", symbolAr: "€", name: "Euro", nameAr: "يورو", decimals: 2, locale: "en-DE", localeAr: "ar-DE" },
  GBP: { code: "GBP", symbol: "£", symbolAr: "£", name: "British Pound", nameAr: "جنيه إسترليني", decimals: 2, locale: "en-GB", localeAr: "ar-GB" },
};

/**
 * Format a number as currency (returns a plain string).
 * For rich rendering with official SAR/AED font symbols, use the <Price> component instead.
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
  return Object.values(CURRENCIES).map((c) => ({
    code: c.code,
    name: c.name,
    nameAr: c.nameAr,
    symbol: c.symbol,
    symbolAr: c.symbolAr,
  }));
}
