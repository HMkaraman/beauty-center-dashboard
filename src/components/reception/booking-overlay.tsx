"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingStepClientServices } from "./booking-step-client-services";
import { BookingStepProviderTime, type ServiceAssignment } from "./booking-step-provider-time";
import { BookingStepConfirm } from "./booking-step-confirm";
import { useCreateAppointment } from "@/lib/hooks/use-appointments";
import { useInvalidateReception } from "@/lib/hooks/use-reception";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import type { SelectedService } from "./service-browser";

interface ClientValue {
  clientId: string;
  clientName: string;
  clientPhone: string;
}

interface BookingOverlayProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = ["client-services", "provider-time", "confirm"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  "client-services": "stepClientServices",
  "provider-time": "stepProviderTime",
  confirm: "stepConfirm",
};

export function BookingOverlay({ open, onClose }: BookingOverlayProps) {
  const t = useTranslations("reception");
  const tc = useTranslations("common");
  const locale = useLocale();
  const createAppointment = useCreateAppointment();
  const invalidateReception = useInvalidateReception();

  const { data: employeesData } = useEmployees({ limit: 200 });
  const allEmployees = employeesData?.data ?? [];
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allDoctors = doctorsData?.data ?? [];

  const [step, setStep] = useState<Step>("client-services");
  const [client, setClient] = useState<ClientValue | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const handleAddService = (service: SelectedService) => {
    setSelectedServices((prev) => [...prev, service]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
    setAssignments((prev) => prev.filter((a) => a.service.serviceId !== serviceId));
  };

  const goToProviderTime = () => {
    const newAssignments = selectedServices.map((service) => {
      const existing = assignments.find((a) => a.service.serviceId === service.serviceId);
      if (existing) return existing;
      return {
        service,
        employeeId: "",
        employeeName: "",
        doctorId: "",
        doctorName: "",
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
    setAssignments(newAssignments);
    setStep("provider-time");
  };

  const updateAssignment = useCallback(
    (serviceId: string, field: string, value: string) => {
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.service.serviceId !== serviceId) return a;
          const updated = { ...a, [field]: value };
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
    },
    [allEmployees, allDoctors]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const clientId = client?.clientId;
      const clientName = client?.clientName || "";
      const clientPhone = client?.clientPhone || "";

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
      resetAndClose();
    } catch {
      toast.error(tc("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep("client-services");
    setClient(null);
    setSelectedServices([]);
    setAssignments([]);
    onClose();
  };

  const canNext = (() => {
    switch (step) {
      case "client-services":
        return !!client?.clientId && selectedServices.length > 0;
      case "provider-time":
        return assignments.every((a) => a.time);
      default:
        return false;
    }
  })();

  const handleNext = () => {
    if (step === "client-services") {
      goToProviderTime();
    } else if (step === "provider-time") {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={resetAndClose}>
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-bold">{t("newBooking")}</h2>
            </div>

            {/* Step indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      i <= stepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-english">{i + 1}</span>
                    <span>{t(STEP_LABELS[s])}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-6 ${i < stepIndex ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile step indicator */}
            <div className="flex sm:hidden items-center gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full ${
                    i <= stepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {step === "client-services" && (
              <BookingStepClientServices
                client={client}
                onClientChange={setClient}
                selectedServices={selectedServices}
                onAddService={handleAddService}
                onRemoveService={handleRemoveService}
              />
            )}
            {step === "provider-time" && (
              <BookingStepProviderTime
                assignments={assignments}
                onUpdateAssignment={updateAssignment}
              />
            )}
            {step === "confirm" && (
              <BookingStepConfirm
                client={client}
                assignments={assignments}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-3 flex items-center gap-2">
            {stepIndex > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            )}
            <div className="flex-1" />
            {step === "confirm" ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                <Check className="h-4 w-4" />
                {t("confirmBooking")}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canNext} size="lg">
                {t("next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
