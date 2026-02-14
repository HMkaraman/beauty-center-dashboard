"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doctorSpecialties } from "@/lib/mock-data";
import { useDoctorsStore } from "@/store/useDoctorsStore";
import { Doctor } from "@/types";

interface NewDoctorSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Doctor | null; }
const emptyForm = { name: "", specialty: "", phone: "", email: "", licenseNumber: "" };

export function NewDoctorSheet({ open, onOpenChange, editItem }: NewDoctorSheetProps) {
  const t = useTranslations("doctors");
  const tc = useTranslations("common");
  const { addItem, updateItem } = useDoctorsStore();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) { setForm({ name: editItem.name, specialty: editItem.specialty, phone: editItem.phone, email: editItem.email, licenseNumber: editItem.licenseNumber }); }
    else { setForm(emptyForm); }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.specialty) { toast.error(tc("requiredField")); return; }
    if (editItem) {
      updateItem(editItem.id, { name: form.name, specialty: form.specialty, phone: form.phone, email: form.email, licenseNumber: form.licenseNumber });
      toast.success(tc("updateSuccess"));
    } else {
      addItem({ name: form.name, specialty: form.specialty, phone: form.phone, email: form.email, licenseNumber: form.licenseNumber, status: "active", rating: 0, consultations: 0 });
      toast.success(tc("addSuccess"));
    }
    setForm(emptyForm); onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newDoctor")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newDoctor")}</SheetDescription></SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("doctorName")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("specialty")}</label>
            <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectSpecialty")} /></SelectTrigger><SelectContent>{doctorSpecialties.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("phone")}</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("email")}</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("licenseNumber")}</label><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="font-english" /></div>
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
