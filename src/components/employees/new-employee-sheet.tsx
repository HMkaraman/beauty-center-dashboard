"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeRoles } from "@/lib/mock-data";
import { useCreateEmployee, useUpdateEmployee } from "@/lib/hooks/use-employees";
import { Employee } from "@/types";

interface NewEmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Employee | null;
}

const emptyForm = { name: "", phone: "", email: "", role: "", specialties: "", hireDate: "" };

export function NewEmployeeSheet({ open, onOpenChange, editItem }: NewEmployeeSheetProps) {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({ name: editItem.name, phone: editItem.phone, email: editItem.email, role: editItem.role, specialties: editItem.specialties, hireDate: editItem.hireDate });
    } else { setForm(emptyForm); }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.role) { toast.error(tc("requiredField")); return; }
    if (editItem) {
      updateEmployee.mutate({ id: editItem.id, data: { name: form.name, phone: form.phone, email: form.email, role: form.role, specialties: form.specialties, hireDate: form.hireDate } }, { onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); } });
    } else {
      createEmployee.mutate({ name: form.name, phone: form.phone, email: form.email, role: form.role, specialties: form.specialties, status: "active", hireDate: form.hireDate || new Date().toISOString().split("T")[0] }, { onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); } });
    }
    return;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newEmployee")}</SheetTitle>
          <SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newEmployee")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeeName")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeePhone")}</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeeEmail")}</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("role")}</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectRole")} /></SelectTrigger><SelectContent>{employeeRoles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("specialties")}</label><Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("hireDate")}</label><Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="font-english" /></div>
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
