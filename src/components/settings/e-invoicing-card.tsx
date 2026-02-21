"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function EInvoicingCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    eInvoicingEnabled: false,
    eInvoicingMode: "none" as string,
    zatcaEnvironment: "sandbox" as string,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        eInvoicingEnabled: settings.eInvoicingEnabled === 1 || settings.eInvoicingEnabled === true,
        eInvoicingMode: settings.eInvoicingMode || "none",
        zatcaEnvironment: settings.zatcaEnvironment || "sandbox",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        eInvoicingEnabled: form.eInvoicingEnabled,
        eInvoicingMode: form.eInvoicingMode,
        zatcaEnvironment: form.zatcaEnvironment,
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
        <h3 className="text-base font-semibold text-foreground mb-4">{t("eInvoicing.title")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("eInvoicing.title")}</h3>
      <div className="space-y-4">
        {/* Enable/Disable toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <span className="text-sm font-medium text-foreground">{t("eInvoicing.enabled")}</span>
            <p className="text-xs text-muted-foreground">{t("eInvoicing.enabledDescription")}</p>
          </div>
          <button
            onClick={() => setForm({ ...form, eInvoicingEnabled: !form.eInvoicingEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.eInvoicingEnabled ? "bg-green-500" : "bg-muted"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.eInvoicingEnabled ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"}`} />
          </button>
        </div>

        {form.eInvoicingEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("eInvoicing.mode")}</label>
              <Select value={form.eInvoicingMode} onValueChange={(v) => setForm({ ...form, eInvoicingMode: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zatca">{t("eInvoicing.modeZatca")}</SelectItem>
                  <SelectItem value="uae_fta">{t("eInvoicing.modeUaeFta")}</SelectItem>
                  <SelectItem value="none">{t("eInvoicing.modeNone")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Environment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("eInvoicing.environment")}</label>
              <Select value={form.zatcaEnvironment} onValueChange={(v) => setForm({ ...form, zatcaEnvironment: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">{t("eInvoicing.envSandbox")}</SelectItem>
                  <SelectItem value="production">{t("eInvoicing.envProduction")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
