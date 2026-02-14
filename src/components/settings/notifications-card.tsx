"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface NotificationSetting {
  key: string;
  enabled: boolean;
}

export function NotificationsCard() {
  const t = useTranslations("settings");
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { key: "emailNotifications", enabled: true },
    { key: "smsNotifications", enabled: true },
    { key: "appointmentReminders", enabled: true },
    { key: "marketingEmails", enabled: false },
  ]);

  const toggle = (index: number) => {
    setSettings((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("notifications")}</h3>
      <div className="space-y-4">
        {settings.map((setting, index) => (
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
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  );
}
