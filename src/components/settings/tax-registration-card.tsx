"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function TaxRegistrationCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    taxRegistrationNumber: "",
    businessAddress: "",
    businessPhone: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        taxRegistrationNumber: (settings as Record<string, unknown>).taxRegistrationNumber as string || "",
        businessAddress: (settings as Record<string, unknown>).businessAddress as string || "",
        businessPhone: (settings as Record<string, unknown>).businessPhone as string || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        taxRegistrationNumber: form.taxRegistrationNumber || undefined,
        businessAddress: form.businessAddress || undefined,
        businessPhone: form.businessPhone || undefined,
      } as Record<string, unknown>,
      {
        onSuccess: () => toast.success(tc("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("taxRegistration.title")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("taxRegistration.title")}</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxRegistration.trn")}</label>
          <Input
            value={form.taxRegistrationNumber}
            onChange={(e) => setForm({ ...form, taxRegistrationNumber: e.target.value })}
            placeholder={t("taxRegistration.trnPlaceholder")}
            className="font-english"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxRegistration.businessAddress")}</label>
          <Input
            value={form.businessAddress}
            onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
            placeholder={t("taxRegistration.businessAddressPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("taxRegistration.businessPhone")}</label>
          <Input
            value={form.businessPhone}
            onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
            placeholder={t("taxRegistration.businessPhonePlaceholder")}
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
