"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { employeeRoles } from "@/lib/mock-data";
import { useEmployee, useCreateEmployee, useUpdateEmployee } from "@/lib/hooks/use-employees";
import { useSections, useSetSectionEmployees } from "@/lib/hooks/use-sections";
import { uploadFileApi } from "@/lib/api/upload";
import { Employee } from "@/types";

interface EmployeeFormPageProps {
  employeeId?: string;
}

export function EmployeeFormPage({ employeeId }: EmployeeFormPageProps) {
  const t = useTranslations("employees");
  const tc = useTranslations("common");
  const ts = useTranslations("sections");
  const router = useRouter();
  const isEdit = !!employeeId;

  const { data: existingEmployee, isLoading: loadingEmployee } = useEmployee(employeeId || "");
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: sectionsData } = useSections({ limit: 100 });
  const allSections = sectionsData?.data ?? [];
  const setSectionEmployees = useSetSectionEmployees();

  // Personal info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState("active");

  // Employment
  const [role, setRole] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [hireDate, setHireDate] = useState("");

  // Sections
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  // Compensation
  const [salary, setSalary] = useState("");
  const [commissionRate, setCommissionRate] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedId = useRef<string | null>(null);

  const clearFormError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingEmployee && initializedId.current !== existingEmployee.id) {
      initializedId.current = existingEmployee.id;
      setName(existingEmployee.name);
      setPhone(existingEmployee.phone);
      setEmail(existingEmployee.email || "");
      setDateOfBirth(existingEmployee.dateOfBirth || "");
      setNationalId(existingEmployee.nationalId || "");
      setPassportNumber(existingEmployee.passportNumber || "");
      setAddress(existingEmployee.address || "");
      setEmergencyContact(existingEmployee.emergencyContact || "");
      setImage((existingEmployee as unknown as { image?: string | null }).image ?? null);
      setStatus(existingEmployee.status);
      setRole(existingEmployee.role);
      setSpecialties(existingEmployee.specialties || "");
      setHireDate(existingEmployee.hireDate || "");
      setSalary(existingEmployee.salary != null ? String(existingEmployee.salary) : "");
      setCommissionRate((existingEmployee as Employee & { commissionRate?: number }).commissionRate != null ? String((existingEmployee as Employee & { commissionRate?: number }).commissionRate) : "");
      setNotes(existingEmployee.notes || "");

      // Set section assignments
      const empSections = allSections.filter((s) => s.employeeIds?.includes(existingEmployee.id)).map((s) => s.id);
      setSelectedSectionIds(empSections);
    }
  }, [isEdit, existingEmployee, allSections]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const updateSectionAssignments = (empId: string) => {
    for (const section of allSections) {
      const currentlyAssigned = section.employeeIds?.includes(empId) ?? false;
      const shouldBeAssigned = selectedSectionIds.includes(section.id);
      if (currentlyAssigned !== shouldBeAssigned) {
        const newIds = shouldBeAssigned
          ? [...(section.employeeIds ?? []), empId]
          : (section.employeeIds ?? []).filter((id) => id !== empId);
        setSectionEmployees.mutate({ id: section.id, employeeIds: newIds });
      }
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!name) errors.name = tc("requiredField");
    if (!role) errors.role = tc("requiredField");
    if (!phone) errors.phone = tc("requiredField");

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(tc("requiredField"));
      const firstKey = Object.keys(errors)[0];
      setTimeout(() => {
        document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }
    setFormErrors({});

    setIsSaving(true);

    try {
      let imageUrl = image;
      if (imageFile) {
        const result = await uploadFileApi(imageFile, "employees");
        imageUrl = result.url;
      }

      const payload: Record<string, unknown> = {
        name,
        phone,
        email: email || undefined,
        image: imageUrl,
        role,
        specialties: specialties || undefined,
        hireDate: hireDate || new Date().toISOString().split("T")[0],
        dateOfBirth: dateOfBirth || undefined,
        nationalId: nationalId || undefined,
        passportNumber: passportNumber || undefined,
        address: address || undefined,
        emergencyContact: emergencyContact || undefined,
        salary: salary ? parseFloat(salary) : undefined,
        commissionRate: commissionRate ? parseFloat(commissionRate) : undefined,
        notes: notes || undefined,
      };

      if (isEdit && employeeId) {
        payload.status = status;
        await updateEmployee.mutateAsync({ id: employeeId, data: payload });
        updateSectionAssignments(employeeId);
        toast.success(tc("updateSuccess"));
      } else {
        payload.status = "active";
        const created = await createEmployee.mutateAsync(payload) as { id: string };
        updateSectionAssignments(created.id);
        toast.success(tc("addSuccess"));
      }
      router.push("/employees");
    } catch {
      toast.error(tc("errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && loadingEmployee) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} size="icon-xs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isEdit ? t("editEmployee") : t("newEmployee")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {t("close")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "..." : t("saveEmployee")}
          </Button>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("personalInfo")}</h2>

        <FormField label={t("employeeName")} required error={formErrors.name}>
          <Input name="name" value={name} onChange={(e) => { setName(e.target.value); clearFormError("name"); }} aria-invalid={!!formErrors.name} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t("employeePhone")} required error={formErrors.phone}>
            <Input name="phone" value={phone} onChange={(e) => { setPhone(e.target.value); clearFormError("phone"); }} className="font-english" dir="ltr" aria-invalid={!!formErrors.phone} />
          </FormField>
          <FormField label={t("employeeEmail")}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="font-english" dir="ltr" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("dateOfBirth")}</label>
            <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="font-english" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("nationalId")}</label>
            <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="font-english" dir="ltr" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("passportNumber")}</label>
            <Input value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className="font-english" dir="ltr" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("emergencyContact")}</label>
            <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("address")}</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("image")}</label>
          <div className="flex items-center gap-4">
            {image ? (
              <div className="relative">
                <Avatar size="lg" className="!size-16">
                  <AvatarImage src={image} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => { setImage(null); setImageFile(null); }}
                  className="absolute -top-1 -end-1 rounded-full bg-destructive p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border hover:border-gold/50 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {t("uploadImage")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">{t("status")}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("statusActive")}</SelectItem>
                <SelectItem value="on-leave">{t("statusOnLeave")}</SelectItem>
                <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Section 2: Employment */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("employment")}</h2>

        <FormField label={t("role")} required error={formErrors.role}>
          <Select value={role} onValueChange={(v) => { setRole(v); clearFormError("role"); }}>
            <SelectTrigger className="w-full" aria-invalid={!!formErrors.role} data-field="role">
              <SelectValue placeholder={t("selectRole")} />
            </SelectTrigger>
            <SelectContent>
              {employeeRoles.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("specialties")}</label>
          <Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("hireDate")}</label>
          <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="font-english" />
        </div>
      </div>

      {/* Section 3: Sections Assignment */}
      {allSections.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">{ts("title")}</h2>
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

      {/* Section 4: Compensation */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("compensationSection")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("monthlySalary")}</label>
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("commissionRatePercent")}</label>
            <Input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Notes */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("notes")}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
      <div className="flex items-center justify-between py-3">
        <div className="h-8 w-40 rounded bg-secondary/50" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded bg-secondary/50" />
          <div className="h-9 w-24 rounded bg-secondary/50" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
        </div>
      ))}
    </div>
  );
}
