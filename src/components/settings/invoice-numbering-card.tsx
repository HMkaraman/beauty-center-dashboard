"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";

export function InvoiceNumberingCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    invoicePrefix: "INV",
    nextInvoiceNumber: 1,
    nextCreditNoteNumber: 1,
  });

  useEffect(() => {
    if (settings) {
      const s = settings as Record<string, unknown>;
      setForm({
        invoicePrefix: (s.invoicePrefix as string) || "INV",
        nextInvoiceNumber: (s.nextInvoiceNumber as number) || 1,
        nextCreditNoteNumber: (s.nextCreditNoteNumber as number) || 1,
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        invoicePrefix: form.invoicePrefix,
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
        <h3 className="text-base font-semibold text-foreground mb-4">{t("invoiceNumbering.title")}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("invoiceNumbering.title")}</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("invoiceNumbering.prefix")}</label>
          <Input
            value={form.invoicePrefix}
            onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
            placeholder={t("invoiceNumbering.prefixPlaceholder")}
            maxLength={10}
            className="font-english"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("invoiceNumbering.nextNumber")}</label>
          <Input
            type="number"
            value={form.nextInvoiceNumber}
            disabled
            className="font-english"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("invoiceNumbering.nextCreditNoteNumber")}</label>
          <Input
            type="number"
            value={form.nextCreditNoteNumber}
            disabled
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
