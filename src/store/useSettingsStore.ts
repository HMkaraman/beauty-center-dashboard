import { create } from "zustand";

export interface ExchangeRate {
  rate: number;
  isManual: boolean;
  updatedAt: string;
}

interface SettingsState {
  currency: string;
  country: string;
  taxRate: number;
  taxEnabled: boolean;
  exchangeRates: Record<string, ExchangeRate>;
  isHydrated: boolean;
  hydrate: (settings: {
    currency?: string;
    country?: string;
    taxRate?: number;
    taxEnabled?: number | boolean;
    exchangeRates?: string | Record<string, ExchangeRate> | null;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: "SAR",
  country: "",
  taxRate: 15,
  taxEnabled: true,
  exchangeRates: {},
  isHydrated: false,
  hydrate: (settings) => {
    let parsedRates: Record<string, ExchangeRate> = {};
    if (typeof settings.exchangeRates === "string" && settings.exchangeRates) {
      try {
        parsedRates = JSON.parse(settings.exchangeRates);
      } catch {
        // ignore parse errors
      }
    } else if (typeof settings.exchangeRates === "object" && settings.exchangeRates !== null) {
      parsedRates = settings.exchangeRates;
    }

    set({
      currency: settings.currency || "SAR",
      country: settings.country || "",
      taxRate: settings.taxRate ?? 15,
      taxEnabled: settings.taxEnabled === 1 || settings.taxEnabled === true,
      exchangeRates: parsedRates,
      isHydrated: true,
    });
  },
}));
