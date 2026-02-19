/** @deprecated Use BookingOverlay instead */
"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientCombobox } from "@/components/appointments/client-combobox";
import { ServiceBrowser, type SelectedService } from "./service-browser";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { useSections } from "@/lib/hooks/use-sections";
import { useServiceCategories } from "@/lib/hooks/use-service-categories";
import { useCreateAppointment } from "@/lib/hooks/use-appointments";
import { useCreateClient } from "@/lib/hooks/use-clients";
import { useInvalidateReception } from "@/lib/hooks/use-reception";
import { Price } from "@/components/ui/price";

interface QuickBookingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClientValue {
  clientId: string;
  clientName: string;
  clientPhone: string;
}

interface ServiceAssignment {
  service: SelectedService;
  employeeId: string;
  employeeName: string;
  doctorId: string;
  doctorName: string;
  time: string;
}

const STEPS = ["client", "services", "providers", "confirm"] as const;
type Step = (typeof STEPS)[number];

export function QuickBookingWizard({ open, onOpenChange }: QuickBookingWizardProps) {
  const t = useTranslations("reception");
  const tc = useTranslations("common");
  const locale = useLocale();
  const createAppointment = useCreateAppointment();
  const createClient = useCreateClient();
  const invalidateReception = useInvalidateReception();

  const [step, setStep] = useState<Step>("client");
  const [client, setClient] = useState<ClientValue | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employeesData } = useEmployees({ limit: 200 });
  const allEmployees = employeesData?.data ?? [];
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allDoctors = doctorsData?.data ?? [];
  const { data: sectionsData } = useSections({ limit: 100 });
  const sections = sectionsData?.data ?? [];

  // Get section ID for a service based on its category
  const getSectionForService = useCallback((service: SelectedService) => {
    if (!service.categoryId) return null;
    // Find which section this category belongs to
    for (const section of sections) {
      // Check categories data
    }
    return null;
  }, [sections]);

  // Get employees/doctors filtered by service's section
  const getFilteredProviders = useCallback((service: SelectedService) => {
    if (!service.categoryId) return { employees: allEmployees, doctors: allDoctors };

    // Find the section for this service's category
    let sectionId: string | null = null;
    for (const section of sections) {
      if (section.employeeIds || section.doctorIds) {
        // We need to check via categories
      }
    }

    // For now, if we can't determine the section, show all providers
    // Section-based filtering will work when categories have sectionId
    return { employees: allEmployees, doctors: allDoctors };
  }, [allEmployees, allDoctors, sections]);

  const handleAddService = (service: SelectedService) => {
    setSelectedServices((prev) => [...prev, service]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
    setAssignments((prev) => prev.filter((a) => a.service.serviceId !== serviceId));
  };

  const goToProviders = () => {
    // Initialize assignments for services that don't have one
    const newAssignments = selectedServices.map((service) => {
      const existing = assignments.find((a) => a.service.serviceId === service.serviceId);
      if (existing) return existing;
      return {
        service,
        employeeId: "",
        employeeName: "",
        doctorId: "",
        doctorName: "",
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      };
    });
    setAssignments(newAssignments);
    setStep("providers");
  };

  const updateAssignment = (serviceId: string, field: string, value: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.service.serviceId !== serviceId) return a;
        const updated = { ...a, [field]: value };
        // Auto-fill names
        if (field === "employeeId") {
          const emp = allEmployees.find((e) => e.id === value);
          updated.employeeName = emp?.name || "";
        }
        if (field === "doctorId") {
          const doc = allDoctors.find((d) => d.id === value);
          updated.doctorName = doc?.name || "";
        }
        return updated;
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let clientId = client?.clientId;
      let clientName = client?.clientName || "";
      let clientPhone = client?.clientPhone || "";

      // Handle walk-in: create client first
      if (isWalkIn && walkInName) {
        const newClient = await createClient.mutateAsync({
          name: walkInName,
          phone: walkInPhone,
          status: "active",
        });
        clientId = newClient.id;
        clientName = newClient.name;
        clientPhone = newClient.phone || "";
      }

      if (!clientName) {
        toast.error(tc("requiredField"));
        setIsSubmitting(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const groupId = assignments.length > 1 ? crypto.randomUUID() : undefined;

      for (const assignment of assignments) {
        await createAppointment.mutateAsync({
          clientId,
          clientName,
          clientPhone,
          serviceId: assignment.service.serviceId,
          service: assignment.service.name,
          employeeId: assignment.employeeId || undefined,
          employee: assignment.employeeName || "",
          doctorId: assignment.doctorId || undefined,
          doctor: assignment.doctorName || undefined,
          date: today,
          time: assignment.time,
          duration: assignment.service.duration,
          price: assignment.service.price,
          status: "confirmed",
          groupId,
        });
      }

      toast.success(t("bookingCreated"));
      invalidateReception();
      resetWizard();
      onOpenChange(false);
    } catch {
      toast.error(tc("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep("client");
    setClient(null);
    setIsWalkIn(false);
    setWalkInName("");
    setWalkInPhone("");
    setSelectedServices([]);
    setAssignments([]);
  };

  const stepIndex = STEPS.indexOf(step);
  const canNext = (() => {
    switch (step) {
      case "client":
        return !!client?.clientId || (isWalkIn && !!walkInName);
      case "services":
        return selectedServices.length > 0;
      case "providers":
        return assignments.every((a) => a.time);
      default:
        return false;
    }
  })();

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) resetWizard(); onOpenChange(v); }}>
      <SheetContent side="left" className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("newBooking")}</SheetTitle>
          <SheetDescription className="sr-only">{t("newBooking")}</SheetDescription>
        </SheetHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-4 pb-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                i <= stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex-1 px-4 space-y-4">
          {/* Step 1: Client */}
          {step === "client" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("selectClient")}</h3>
              {!isWalkIn ? (
                <>
                  <ClientCombobox value={client} onChange={setClient} />
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-background px-2 text-xs text-muted-foreground">
                      {t("or")}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setIsWalkIn(true); setClient(null); }}
                  >
                    {t("walkIn")}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("clientName")}</label>
                    <Input
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("clientPhone")}</label>
                    <Input
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="font-english"
                      dir="ltr"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsWalkIn(false); setWalkInName(""); setWalkInPhone(""); }}
                  >
                    {t("backToSearch")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Services */}
          {step === "services" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("selectServices")}</h3>
              <ServiceBrowser
                selectedServices={selectedServices}
                onAdd={handleAddService}
                onRemove={handleRemoveService}
              />
            </div>
          )}

          {/* Step 3: Provider + Time */}
          {step === "providers" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("assignProviders")}</h3>
              {assignments.map((assignment) => {
                const { employees, doctors } = getFilteredProviders(assignment.service);
                return (
                  <div
                    key={assignment.service.serviceId}
                    className="rounded-lg border border-border p-3 space-y-3"
                  >
                    <p className="text-sm font-medium">{assignment.service.name}</p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">{t("employee")}</label>
                      <Select
                        value={assignment.employeeId}
                        onValueChange={(v) =>
                          updateAssignment(assignment.service.serviceId, "employeeId", v)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("selectEmployee")} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {doctors.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">{t("doctor")}</label>
                        <Select
                          value={assignment.doctorId}
                          onValueChange={(v) =>
                            updateAssignment(assignment.service.serviceId, "doctorId", v)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("selectDoctor")} />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">{t("time")}</label>
                      <Input
                        type="time"
                        value={assignment.time}
                        onChange={(e) =>
                          updateAssignment(assignment.service.serviceId, "time", e.target.value)
                        }
                        className="font-english"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t("confirmBooking")}</h3>
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("client")}</p>
                  <p className="text-sm font-medium">
                    {isWalkIn ? walkInName : client?.clientName}
                  </p>
                  {(isWalkIn ? walkInPhone : client?.clientPhone) && (
                    <p className="text-xs font-english text-muted-foreground">
                      {isWalkIn ? walkInPhone : client?.clientPhone}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-2 space-y-2">
                  {assignments.map((a) => (
                    <div key={a.service.serviceId} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{a.service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.employeeName && a.employeeName}
                          {a.doctorName && ` · ${a.doctorName}`}
                          {` · ${a.time}`}
                        </p>
                      </div>
                      <span className="font-english"><Price value={a.service.price} /></span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>{t("total")}</span>
                  <span className="font-english"><Price value={total} /></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <div className="flex items-center gap-2 w-full">
            {stepIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(STEPS[stepIndex - 1])}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            )}
            <div className="flex-1" />
            {step === "confirm" ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Check className="h-4 w-4" />
                {t("confirmBooking")}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (step === "services") {
                    goToProviders();
                  } else {
                    setStep(STEPS[stepIndex + 1]);
                  }
                }}
                disabled={!canNext}
              >
                {t("next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
