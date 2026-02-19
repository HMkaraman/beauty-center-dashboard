"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { COUNTRIES, getCountryByCode } from "@/lib/constants/countries";
import { getSupportedCurrencies } from "@/lib/currency";

export function CurrencyTaxCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    country: "SA",
    currency: "SAR",
    taxEnabled: true,
    taxRate: 15,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        country: (settings.country as string) || "SA",
        currency: settings.currency || "SAR",
        taxEnabled: settings.taxEnabled === 1 || settings.taxEnabled === true,
        taxRate: settings.taxRate ?? 15,
      });
    }
  }, [settings]);

  const handleCountryChange = (code: string) => {
    const country = getCountryByCode(code);
    if (country) {
      setForm({
        ...form,
        country: code,
        currency: country.defaultCurrency,
        taxRate: country.defaultTaxRate,
      });
    }
  };

  const handleSave = () => {
    updateSettings.mutate(
      {
        country: form.country,
        currency: form.currency,
        taxEnabled: form.taxEnabled,
        taxRate: form.taxRate,
      },
      {
        onSuccess: () => toast.success(tc("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  const currencies = getSupportedCurrencies();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("currencyTax")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("currencyTax")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("country")}</label>
          <Select value={form.country} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {locale === "ar" ? c.nameAr : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("currency")}</label>
          <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectCurrency")} />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {locale === "ar" ? `${c.symbolAr} - ${c.nameAr}` : `${c.symbol} - ${c.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tax Enabled toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxSettings")}</label>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">{t("taxEnabled")}</span>
            <button
              onClick={() => setForm({ ...form, taxEnabled: !form.taxEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.taxEnabled ? "bg-green-500" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.taxEnabled ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Tax Rate */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxRate")}</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) || 0 })}
            disabled={!form.taxEnabled}
            className="font-english"
            dir="ltr"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
