"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/hooks";

const CATEGORIES = [
  { key: "appointment", labelKey: "categoryAppointment" },
  { key: "inventory", labelKey: "categoryInventory" },
  { key: "financial", labelKey: "categoryFinancial" },
  { key: "staff", labelKey: "categoryStaff" },
  { key: "client", labelKey: "categoryClient" },
  { key: "system", labelKey: "categorySystem" },
  { key: "marketing", labelKey: "categoryMarketing" },
] as const;

export function NotificationPreferencesCard() {
  const t = useTranslations("notifications");
  const tc = useTranslations("common");
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePref = useUpdateNotificationPreferences();

  const handleToggle = (category: string, currentValue: boolean) => {
    updatePref.mutate(
      { category, inAppEnabled: !currentValue },
      {
        onSuccess: () => toast.success(t("preferencesUpdated")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">{t("preferences")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("preferencesDescription")}</p>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-6 w-11 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-2">{t("preferences")}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t("preferencesDescription")}</p>

      <div className="space-y-1">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("title")}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("inApp")}
          </span>
        </div>

        {CATEGORIES.map(({ key, labelKey }) => {
          const isEnabled = preferences?.[key]?.inAppEnabled ?? true;
          return (
            <div key={key} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-foreground">{t(labelKey)}</span>
              <button
                onClick={() => handleToggle(key, isEnabled)}
                disabled={updatePref.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? "bg-green-500" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled
                      ? "ltr:translate-x-6 rtl:-translate-x-6"
                      : "ltr:translate-x-1 rtl:-translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
