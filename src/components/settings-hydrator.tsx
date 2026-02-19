"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/lib/hooks/use-settings";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * Syncs React Query settings data into the Zustand store.
 * Wraps children and forces a full re-mount when currency changes,
 * so all formatCurrency() calls pick up the new value.
 */
export function SettingsHydrator({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();
  const hydrate = useSettingsStore((s) => s.hydrate);
  const currency = useSettingsStore((s) => s.currency);
  const taxEnabled = useSettingsStore((s) => s.taxEnabled);
  const prevCurrencyRef = useRef(currency);

  useEffect(() => {
    if (settings) {
      hydrate(settings);
    }
  }, [settings, hydrate]);

  // Track currency changes for the key
  useEffect(() => {
    prevCurrencyRef.current = currency;
  }, [currency]);

  // Use currency + taxEnabled as key so all children re-mount
  // when these settings change, ensuring formatCurrency() reads fresh values
  return (
    <div key={`${currency}-${taxEnabled}`}>
      {children}
    </div>
  );
}
