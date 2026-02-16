"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function GeneralSettingsCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    centerNameAr: "",
    centerNameEn: "",
    language: "ar",
    timezone: "Asia/Riyadh",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        centerNameAr: settings.businessName || "",
        centerNameEn: (settings.businessNameEn as string) || "",
        language: (settings.locale as string) || "ar",
        timezone: (settings.timezone as string) || "Asia/Riyadh",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        businessName: form.centerNameAr,
        locale: form.language,
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
        <h3 className="text-base font-semibold text-foreground mb-4">{t("generalSettings")}</h3>
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
      <h3 className="text-base font-semibold text-foreground mb-4">{t("generalSettings")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("centerNameAr")}</label>
          <Input value={form.centerNameAr} onChange={(e) => setForm({ ...form, centerNameAr: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("centerNameEn")}</label>
          <Input value={form.centerNameEn} onChange={(e) => setForm({ ...form, centerNameEn: e.target.value })} className="font-english" dir="ltr" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("language")}</label>
          <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("timezone")}</label>
          <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Riyadh">Asia/Riyadh (UTC+3)</SelectItem>
              <SelectItem value="Asia/Dubai">Asia/Dubai (UTC+4)</SelectItem>
              <SelectItem value="Asia/Kuwait">Asia/Kuwait (UTC+3)</SelectItem>
            </SelectContent>
          </Select>
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
