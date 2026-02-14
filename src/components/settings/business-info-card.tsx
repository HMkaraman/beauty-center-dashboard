"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function BusinessInfoCard() {
  const t = useTranslations("settings");
  const [form, setForm] = useState({
    phone: "0112345678",
    email: "info@beautycenter.sa",
    address: "الرياض، حي النخيل، شارع الأمير محمد بن عبدالعزيز",
    taxNumber: "300012345600003",
  });

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
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  );
}
