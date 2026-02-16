"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function BusinessInfoCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        phone: (settings.phone as string) || "",
        email: (settings.email as string) || "",
        address: (settings.address as string) || "",
        taxNumber: (settings.taxNumber as string) || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(form, {
      onSuccess: () => toast.success(tc("updateSuccess")),
      onError: () => toast.error(tc("error")),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("businessInfo")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded sm:col-span-2" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("businessInfo")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("phone")}</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("email")}</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-foreground">{t("address")}</label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxNumber")}</label>
          <Input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} className="font-english" dir="ltr" />
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
