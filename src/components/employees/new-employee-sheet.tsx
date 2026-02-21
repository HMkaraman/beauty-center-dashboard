"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeRoles } from "@/lib/mock-data";
import { useCreateEmployee, useUpdateEmployee } from "@/lib/hooks/use-employees";
import { useSections, useSetSectionEmployees } from "@/lib/hooks/use-sections";
import { Employee } from "@/types";

interface NewEmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Employee | null;
}

const emptyForm = {
  name: "", phone: "", email: "", role: "", specialties: "", hireDate: "",
  nationalId: "", passportNumber: "", dateOfBirth: "", address: "", emergencyContact: "",
  salary: "", commissionRate: "", notes: "",
};

export function NewEmployeeSheet({ open, onOpenChange, editItem }: NewEmployeeSheetProps) {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const ts = useTranslations("sections");
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: sectionsData } = useSections({ limit: 100 });
  const allSections = useMemo(() => sectionsData?.data ?? [], [sectionsData?.data]);
  const setSectionEmployees = useSetSectionEmployees();
  const [form, setForm] = useState(emptyForm);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name, phone: editItem.phone, email: editItem.email, role: editItem.role,
        specialties: editItem.specialties, hireDate: editItem.hireDate,
        nationalId: editItem.nationalId || "", passportNumber: editItem.passportNumber || "",
        dateOfBirth: editItem.dateOfBirth || "", address: editItem.address || "",
        emergencyContact: editItem.emergencyContact || "",
        salary: editItem.salary != null ? String(editItem.salary) : "",
        commissionRate: (editItem as Employee & { commissionRate?: number }).commissionRate != null ? String((editItem as Employee & { commissionRate?: number }).commissionRate) : "",
        notes: editItem.notes || "",
      });
      // Find sections this employee belongs to
      const empSections = allSections.filter((s) => s.employeeIds?.includes(editItem.id)).map((s) => s.id);
      setSelectedSectionIds(empSections);
    } else {
      setForm(emptyForm);
      setSelectedSectionIds([]);
    }
  }, [editItem, open, allSections]);

  const handleSubmit = () => {
    if (!form.name || !form.role) { toast.error(tc("requiredField")); return; }

    const payload: Record<string, unknown> = {
      name: form.name, phone: form.phone, email: form.email, role: form.role,
      specialties: form.specialties, hireDate: form.hireDate || new Date().toISOString().split("T")[0],
      nationalId: form.nationalId || undefined, passportNumber: form.passportNumber || undefined,
      dateOfBirth: form.dateOfBirth || undefined, address: form.address || undefined,
      emergencyContact: form.emergencyContact || undefined,
      salary: form.salary ? parseFloat(form.salary) : undefined,
      commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : undefined,
      notes: form.notes || undefined,
    };

    const updateSectionAssignments = (employeeId: string) => {
      // For each section, update its employee list
      for (const section of allSections) {
        const currentlyAssigned = section.employeeIds?.includes(employeeId) ?? false;
        const shouldBeAssigned = selectedSectionIds.includes(section.id);
        if (currentlyAssigned !== shouldBeAssigned) {
          const newIds = shouldBeAssigned
            ? [...(section.employeeIds ?? []), employeeId]
            : (section.employeeIds ?? []).filter((id) => id !== employeeId);
          setSectionEmployees.mutate({ id: section.id, employeeIds: newIds });
        }
      }
    };

    if (editItem) {
      updateEmployee.mutate({ id: editItem.id, data: payload }, {
        onSuccess: () => {
          updateSectionAssignments(editItem.id);
          toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false);
        },
      });
    } else {
      createEmployee.mutate({ ...payload, status: "active" } as Record<string, unknown>, {
        onSuccess: (created: { id: string }) => {
          updateSectionAssignments(created.id);
          toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false);
        },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newEmployee")}</SheetTitle>
          <SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newEmployee")}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-6 px-4">
          {/* Personal Info Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("personalInfo")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeeName")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeePhone")}</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("employeeEmail")}</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("dateOfBirth")}</label><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="font-english" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("nationalId")}</label><Input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("passportNumber")}</label><Input value={form.passportNumber} onChange={(e) => setForm({ ...form, passportNumber: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("address")}</label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("emergencyContact")}</label><Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
          </div>

          {/* Employment Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("employment")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("role")}</label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectRole")} /></SelectTrigger><SelectContent>{employeeRoles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("specialties")}</label><Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("hireDate")}</label><Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="font-english" /></div>
          </div>

          {/* Sections Assignment */}
          {allSections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{ts("title")}</h3>
              <div className="flex flex-wrap gap-2">
                {allSections.map((section) => {
                  const isSelected = selectedSectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        setSelectedSectionIds(
                          isSelected
                            ? selectedSectionIds.filter((id) => id !== section.id)
                            : [...selectedSectionIds, section.id]
                        )
                      }
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary"
                      }`}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: section.color || "#6B7280" }}
                      />
                      {section.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compensation Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{t("compensationSection")}</h3>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("monthlySalary")}</label><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="font-english" dir="ltr" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("commissionRatePercent")}</label><Input type="number" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} className="font-english" dir="ltr" /></div>
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
