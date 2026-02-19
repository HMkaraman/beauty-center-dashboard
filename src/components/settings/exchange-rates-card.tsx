"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings, useFetchExchangeRates } from "@/lib/hooks/use-settings";
import { getSupportedCurrencies } from "@/lib/currency";
import type { ExchangeRateEntry } from "@/lib/api/settings";

interface RateRow {
  code: string;
  rate: string;
  isManual: boolean;
  updatedAt: string;
}

export function ExchangeRatesCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const fetchRates = useFetchExchangeRates();

  const [rows, setRows] = useState<RateRow[]>([]);
  const baseCurrency = settings?.currency || "SAR";

  useEffect(() => {
    if (settings?.exchangeRates) {
      try {
        const parsed: Record<string, ExchangeRateEntry> =
          typeof settings.exchangeRates === "string"
            ? JSON.parse(settings.exchangeRates)
            : {};
        const entries = Object.entries(parsed).map(([code, entry]) => ({
          code,
          rate: String(entry.rate),
          isManual: entry.isManual,
          updatedAt: entry.updatedAt,
        }));
        setRows(entries);
      } catch {
        setRows([]);
      }
    } else {
      setRows([]);
    }
  }, [settings?.exchangeRates]);

  const currencies = getSupportedCurrencies();
  const usedCodes = new Set(rows.map((r) => r.code));
  usedCodes.add(baseCurrency);
  const availableCurrencies = currencies.filter((c) => !usedCodes.has(c.code));

  const addRow = () => {
    if (availableCurrencies.length === 0) return;
    setRows([
      ...rows,
      { code: availableCurrencies[0].code, rate: "0", isManual: false, updatedAt: new Date().toISOString() },
    ]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: "code" | "rate", value: string) => {
    const n = [...rows];
    n[idx] = { ...n[idx], [field]: value };
    if (field === "rate") {
      n[idx].isManual = true;
      n[idx].updatedAt = new Date().toISOString();
    }
    setRows(n);
  };

  const handleFetchRates = () => {
    fetchRates.mutate(undefined, {
      onSuccess: () => toast.success(t("ratesFetchSuccess")),
      onError: () => toast.error(tc("error")),
    });
  };

  const handleSave = () => {
    const ratesObj: Record<string, ExchangeRateEntry> = {};
    for (const row of rows) {
      ratesObj[row.code] = {
        rate: Number(row.rate) || 0,
        isManual: row.isManual,
        updatedAt: row.updatedAt,
      };
    }
    updateSettings.mutate(
      { exchangeRates: JSON.stringify(ratesObj) },
      {
        onSuccess: () => toast.success(tc("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("exchangeRates")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-48" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{t("exchangeRates")}</h3>
        <span className="text-xs text-muted-foreground">
          {t("baseCurrency")}: <span className="font-english font-medium">{baseCurrency}</span>
        </span>
      </div>

      {/* Rate rows */}
      {rows.length > 0 && (
        <div className="space-y-3 mb-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
            <span className="col-span-3">{t("currency")}</span>
            <span className="col-span-3">{t("rate")}</span>
            <span className="col-span-2">{t("source")}</span>
            <span className="col-span-3">{t("lastUpdated")}</span>
            <span className="col-span-1" />
          </div>
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <Select value={row.code} onValueChange={(v) => updateRow(idx, "code", v)}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show current + available */}
                    <SelectItem value={row.code}>
                      {row.code}
                    </SelectItem>
                    {availableCurrencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  min={0}
                  step="0.0001"
                  value={row.rate}
                  onChange={(e) => updateRow(idx, "rate", e.target.value)}
                  className="font-english text-sm"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${row.isManual ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"}`}>
                  {row.isManual ? t("sourceManual") : t("sourceAuto")}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-xs text-muted-foreground font-english">
                  {formatDate(row.updatedAt)}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => removeRow(idx)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={addRow} disabled={availableCurrencies.length === 0}>
          <Plus className="h-3 w-3" /> {t("addCurrency")}
        </Button>
        {rows.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleFetchRates} disabled={fetchRates.isPending}>
            <RefreshCw className={`h-3 w-3 ${fetchRates.isPending ? "animate-spin" : ""}`} />
            {fetchRates.isPending ? t("fetchingRates") : t("fetchLatestRates")}
          </Button>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? t("saving") : t("save")}
          </Button>
        </div>
      )}
    </div>
  );
}
