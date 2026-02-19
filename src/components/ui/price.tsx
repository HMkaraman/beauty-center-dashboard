"use client";

import { useLocale } from "next-intl";
import { useSettingsStore } from "@/store/useSettingsStore";

const DECIMALS: Record<string, number> = {
  SAR: 2, AED: 2, BHD: 3, OMR: 3, KWD: 3, QAR: 2,
  IQD: 0, JOD: 3, EGP: 2, LBP: 0, TRY: 2, MAD: 2,
  TND: 3, USD: 2, EUR: 2, GBP: 2,
};

// Currencies with official symbol fonts rendered via @font-face in /public/currency-fonts.css
// Using explicit inline fontFamily guarantees the browser uses our web font, not a system font
const FONT_SYMBOLS: Record<string, { char: string; fontFamily: string }> = {
  SAR: { char: "\uE900", fontFamily: "SaudiRiyal" },
  AED: { char: "\u00EA", fontFamily: "UAEDirham" },
};

interface PriceProps {
  value: number | string;
  currency?: string;
  className?: string;
}

export function Price({ value, currency, className }: PriceProps) {
  const locale = useLocale();
  const storeCurrency = useSettingsStore((s) => s.currency);
  const resolved = currency || storeCurrency || "SAR";
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return <span className={className}>0</span>;

  const decimals = DECIMALS[resolved] ?? 2;
  const fontSymbol = FONT_SYMBOLS[resolved];

  if (fontSymbol) {
    const displayLocale = locale === "ar" ? "ar-SA" : "en-US";
    const formatted = new Intl.NumberFormat(displayLocale, {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      numberingSystem: "latn",
    }).format(num);

    const sym = (
      <span style={{ fontFamily: fontSymbol.fontFamily }}>{fontSymbol.char}</span>
    );

    return (
      <span className={className}>
        {locale === "ar" ? <>{formatted}{"\u00A0"}{sym}</> : <>{sym}{"\u00A0"}{formatted}</>}
      </span>
    );
  }

  // Other currencies — use Intl.NumberFormat currency style
  try {
    const displayLocale = locale === "ar" ? "ar-SA" : "en-US";
    const formatted = new Intl.NumberFormat(displayLocale, {
      style: "currency",
      currency: resolved,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      numberingSystem: "latn",
    }).format(num);
    return <span className={className}>{formatted}</span>;
  } catch {
    return <span className={className}>{num.toFixed(decimals)}</span>;
  }
}
