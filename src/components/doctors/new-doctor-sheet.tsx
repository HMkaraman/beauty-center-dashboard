"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doctorSpecialties } from "@/lib/mock-data";
import { useCreateDoctor, useUpdateDoctor } from "@/lib/hooks/use-doctors";
import { Doctor } from "@/types";

interface NewDoctorSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Doctor | null; }

const emptyForm = {
  name: "", specialty: "", phone: "", email: "", licenseNumber: "",
  bio: "", education: "", certificates: "", yearsOfExperience: "",
  compensationType: "", salary: "", commissionRate: "", notes: "",
};

export function NewDoctorSheet({ open, onOpenChange, editItem }: NewDoctorSheetProps) {
  const t = useTranslations("doctors");
  const tc = useTranslations("common");
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name, specialty: editItem.specialty, phone: editItem.phone, email: editItem.email,
        licenseNumber: editItem.licenseNumber || "",
        bio: editItem.bio || "", education: editItem.education || "",
        certificates: editItem.certificates || "",
        yearsOfExperience: editItem.yearsOfExperience != null ? String(editItem.yearsOfExperience) : "",
        compensationType: editItem.compensationType || "",
        salary: editItem.salary != null ? String(editItem.salary) : "",
        commissionRate: editItem.commissionRate != null ? String(editItem.commissionRate) : "",
        notes: editItem.notes || "",
      });
    } else { setForm(emptyForm); }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.specialty) { toast.error(tc("requiredField")); return; }

    const payload: Record<string, unknown> = {
      name: form.name, specialty: form.specialty, phone: form.phone, email: form.email,
      licenseNumber: form.licenseNumber || undefined,
      bio: form.bio || undefined, education: form.education || undefined,
      certificates: form.certificates || undefined,
      yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
      compensationType: form.compensationType || undefined,
      salary: form.salary ? parseFloat(form.salary) : undefined,
      commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : undefined,
      notes: form.notes || undefined,
    };

    if (editItem) {
      updateDoctor.mutate({ id: editItem.id, data: payload }, {
        onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    } else {
      createDoctor.mutate({ ...payload, status: "active" } as Record<string, unknown>, {
        onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    }
  };

  const showSalary = !form.compensationType || form.compensationType === "salary" || form.compensationType === "hybrid";
  const showCommission = form.compensationType === "commission" || form.compensationType === "hybrid";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newDoctor")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newDoctor")}</SheetDescription></SheetHeader>
        <div className="flex-1 space-y-6 px-4">
          {/* Personal Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("personalInfo")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("doctorName")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("phone")}</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("email")}</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" /></div>
          </div>

          {/* Professional Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("professionalInfo")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("specialty")}</label>
              <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectSpecialty")} /></SelectTrigger><SelectContent>{doctorSpecialties.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("licenseNumber")}</label><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="font-english" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("bio")}</label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("education")}</label><Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("certificates")}</label><Input value={form.certificates} onChange={(e) => setForm({ ...form, certificates: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("yearsOfExperience")}</label><Input type="number" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} className="font-english" dir="ltr" /></div>
          </div>

          {/* Compensation Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("compensationSection")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("compensationType")}</label>
              <Select value={form.compensationType} onValueChange={(v) => setForm({ ...form, compensationType: v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("compensationType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">{t("compSalaryOnly")}</SelectItem>
                  <SelectItem value="commission">{t("compCommissionOnly")}</SelectItem>
                  <SelectItem value="hybrid">{t("compHybrid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showSalary && (
              <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("monthlySalary")}</label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="font-english" dir="ltr" /></div>
            )}
            {showCommission && (
              <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("commissionRatePercent")}</label><Input type="number" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} className="font-english" dir="ltr" /></div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("notes")}</h3>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
