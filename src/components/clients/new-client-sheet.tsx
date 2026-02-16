"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { Client } from "@/types";

interface NewClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Client | null;
}

const emptyForm = { name: "", phone: "", email: "", notes: "" };

export function NewClientSheet({ open, onOpenChange, editItem }: NewClientSheetProps) {
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({ name: editItem.name, phone: editItem.phone, email: editItem.email, notes: "" });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.phone) { toast.error(tc("requiredField")); return; }
    if (editItem) {
      updateClient.mutate({ id: editItem.id, data: { name: form.name, phone: form.phone, email: form.email } }, {
        onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    } else {
      createClient.mutate({
        name: form.name, phone: form.phone, email: form.email,
        status: "active",
      }, {
        onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    }
    return;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newClient")}</SheetTitle>
          <SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newClient")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientName")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientPhone")}</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientEmail")}</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("notesPlaceholder")} />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
