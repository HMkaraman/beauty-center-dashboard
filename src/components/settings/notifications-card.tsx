"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

interface NotificationSetting {
  key: string;
  enabled: boolean;
  settingsField: string;
}

export function NotificationsCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    { key: "emailNotifications", enabled: false, settingsField: "emailEnabled" },
    { key: "smsNotifications", enabled: false, settingsField: "smsEnabled" },
    { key: "appointmentReminders", enabled: true, settingsField: "appointmentReminders" },
    { key: "marketingEmails", enabled: false, settingsField: "marketingEmails" },
  ]);

  useEffect(() => {
    if (settings) {
      setNotificationSettings((prev) =>
        prev.map((setting) => {
          if (setting.settingsField === "emailEnabled") {
            return { ...setting, enabled: !!settings.emailEnabled };
          }
          if (setting.settingsField === "smsEnabled") {
            return { ...setting, enabled: !!settings.smsEnabled };
          }
          return setting;
        })
      );
    }
  }, [settings]);

  const toggle = (index: number) => {
    setNotificationSettings((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    const emailSetting = notificationSettings.find((s) => s.settingsField === "emailEnabled");
    const smsSetting = notificationSettings.find((s) => s.settingsField === "smsEnabled");
    updateSettings.mutate(
      {
        emailEnabled: emailSetting?.enabled,
        smsEnabled: smsSetting?.enabled,
      },
      {
        onSuccess: () => toast.success(tc("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("notifications")}</h3>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <h3 className="text-base font-semibold text-foreground mb-4">{t("notifications")}</h3>
      <div className="space-y-4">
        {notificationSettings.map((setting, index) => (
          <div key={setting.key} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{t(setting.key)}</span>
            <button
              onClick={() => toggle(index)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled ? "bg-green-500" : "bg-muted"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
