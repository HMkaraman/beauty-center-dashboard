"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function GeneralSettingsCard() {
  const t = useTranslations("settings");
  const [form, setForm] = useState({
    centerNameAr: "بيوتي سنتر",
    centerNameEn: "Beauty Center",
    language: "ar",
    timezone: "Asia/Riyadh",
  });

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
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  );
}
