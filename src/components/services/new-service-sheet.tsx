"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { serviceCategories } from "@/lib/mock-data";
import { useServicesStore } from "@/store/useServicesStore";
import { Service } from "@/types";

interface NewServiceSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Service | null; }
const emptyForm = { name: "", category: "", duration: "", price: "", description: "" };

export function NewServiceSheet({ open, onOpenChange, editItem }: NewServiceSheetProps) {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const { addItem, updateItem } = useServicesStore();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) { setForm({ name: editItem.name, category: editItem.category, duration: String(editItem.duration), price: String(editItem.price), description: "" }); }
    else { setForm(emptyForm); }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price) { toast.error(tc("requiredField")); return; }
    if (editItem) {
      updateItem(editItem.id, { name: form.name, category: form.category, duration: Number(form.duration) || 0, price: Number(form.price) || 0 });
      toast.success(tc("updateSuccess"));
    } else {
      addItem({ name: form.name, category: form.category, duration: Number(form.duration) || 0, price: Number(form.price) || 0, status: "active", bookings: 0 });
      toast.success(tc("addSuccess"));
    }
    setForm(emptyForm); onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newService")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newService")}</SheetDescription></SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("name")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("category")}</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger><SelectContent>{serviceCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("duration")}</label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="font-english" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("price")}</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="font-english" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("description")}</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
