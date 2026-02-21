"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Zap, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { ClientCombobox } from "./client-combobox";
import { ClientLeftoverBanner } from "./client-leftover-banner";
import { AppointmentPhotoUploader } from "./appointment-photo-uploader";
import { LaserConsumptionSheet } from "./laser-consumption-sheet";
import { InjectableConsumptionSheet } from "./injectable-consumption-sheet";
import { useServices, useService } from "@/lib/hooks/use-services";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import {
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useCreateRecurringAppointments,
  useAvailableDates,
  useAvailableSlots,
} from "@/lib/hooks/use-appointments";
import { useConsumptionLogs } from "@/lib/hooks/use-consumption-tracking";
import type { Appointment, AppointmentStatus } from "@/types";

const CLEAR_VALUE = "__clear__";

const STATUSES: AppointmentStatus[] = [
  "confirmed", "pending", "waiting", "in-progress",
  "cancelled", "completed", "no-show",
];

const STATUS_KEYS: Record<AppointmentStatus, string> = {
  confirmed: "statusConfirmed",
  pending: "statusPending",
  cancelled: "statusCancelled",
  completed: "statusCompleted",
  "no-show": "statusNoShow",
  waiting: "statusWaiting",
  "in-progress": "statusInProgress",
};

interface ServiceRow {
  serviceId: string;
  employeeId: string;
  doctorId: string;
  date: string;
  time: string;
}

interface AppointmentFormPageProps {
  appointmentId?: string;
}

export function AppointmentFormPage({ appointmentId }: AppointmentFormPageProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const tct = useTranslations("consumptionTracking");
  const router = useRouter();
  const isEdit = !!appointmentId;

  const { data: existingAppointment, isLoading: loadingAppointment } = useAppointment(appointmentId || "");
  const { data: servicesData } = useServices({ limit: 100 });
  const { data: employeesData } = useEmployees({ limit: 100 });
  const { data: doctorsData } = useDoctors({ limit: 100 });

  const servicesList = servicesData?.data ?? [];
  const employeesList = employeesData?.data ?? [];
  const doctorsList = doctorsData?.data ?? [];

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const createRecurring = useCreateRecurringAppointments();

  // Form state
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([
    { serviceId: "", employeeId: "", doctorId: "", date: "", time: "" },
  ]);
  const [manualTimeMode, setManualTimeMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [isSaving, setIsSaving] = useState(false);

  // Conflict warning state
  const [conflictWarning, setConflictWarning] = useState<{
    hasConflict: boolean;
    conflictType?: "employee" | "doctor";
    conflictingAppointment?: { time: string; service: string };
    nextAvailableSlot?: string | null;
    employeeHoursWarning?: { start: string; end: string } | null;
    doctorHoursWarning?: { start: string; end: string } | null;
    clientConflictWarning?: { time: string; service: string } | null;
  } | null>(null);
  const conflictTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Recurrence state
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly">("weekly");
  const [endCondition, setEndCondition] = useState<"occurrences" | "date">("occurrences");
  const [occurrences, setOccurrences] = useState("4");
  const [endDate, setEndDate] = useState("");

  // Consumption sheets (edit mode)
  const [laserSheetOpen, setLaserSheetOpen] = useState(false);
  const [injectableSheetOpen, setInjectableSheetOpen] = useState(false);

  // Get service details for first service row (for consumption)
  const primaryServiceId = serviceRows[0]?.serviceId || "";
  const { data: primaryService } = useService(primaryServiceId);
  const consumptionParams = useMemo(
    () => (isEdit && appointmentId ? { appointmentId } : undefined),
    [isEdit, appointmentId]
  );
  const { data: logsData } = useConsumptionLogs(consumptionParams);
  const consumptionLogs = logsData?.data ?? [];

  // Available dates/slots for first service row
  const firstRow = serviceRows[0];
  const firstServiceId = firstRow?.serviceId || undefined;
  const firstEmployeeId = firstRow?.employeeId || undefined;
  const firstDoctorId = firstRow?.doctorId || undefined;
  const firstDate = firstRow?.date || undefined;

  const datesParams = useMemo(() => ({
    serviceId: firstServiceId,
    employeeId: firstEmployeeId,
    doctorId: firstDoctorId,
    excludeId: appointmentId,
  }), [firstServiceId, firstEmployeeId, firstDoctorId, appointmentId]);

  const { data: datesData, isLoading: datesLoading } = useAvailableDates(datesParams);
  const availableDates = datesData?.dates ?? [];

  const slotsParams = useMemo(() => ({
    date: firstDate,
    serviceId: firstServiceId,
    employeeId: firstEmployeeId,
    doctorId: firstDoctorId,
    excludeId: appointmentId,
  }), [firstDate, firstServiceId, firstEmployeeId, firstDoctorId, appointmentId]);

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(slotsParams);
  const availableSlots = slotsData?.slots ?? [];

  const uniqueSlotTimes = availableSlots.reduce<Array<{ time: string; employeeId: string; employeeName: string }>>((acc, slot) => {
    if (!acc.some((s) => s.time === slot.time)) acc.push(slot);
    return acc;
  }, []);

  const initialized = useRef(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingAppointment && !initialized.current && servicesList.length > 0) {
      initialized.current = true;
      setClientId(existingAppointment.clientId || "");
      setClientName(existingAppointment.clientName);
      setClientPhone(existingAppointment.clientPhone);
      setNotes(existingAppointment.notes || "");
      setStatus(existingAppointment.status);

      const matchedService = servicesList.find((s) => s.name === existingAppointment.service);
      const matchedEmployee = employeesList.find((e) => e.name === existingAppointment.employee);

      setServiceRows([{
        serviceId: matchedService?.id || existingAppointment.serviceId || "",
        employeeId: matchedEmployee?.id || existingAppointment.employeeId || "",
        doctorId: existingAppointment.doctorId || "",
        date: existingAppointment.date,
        time: existingAppointment.time,
      }]);
      setManualTimeMode(true); // pre-populated = manual mode
    }
  }, [isEdit, existingAppointment, servicesList.length, employeesList.length]);

  const updateServiceRow = (index: number, updates: Partial<ServiceRow>) => {
    setServiceRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...updates } : row))
    );
  };

  const addServiceRow = () => {
    setServiceRows((prev) => [
      ...prev,
      { serviceId: "", employeeId: "", doctorId: "", date: firstRow?.date || "", time: "" },
    ]);
  };

  const removeServiceRow = (index: number) => {
    if (serviceRows.length <= 1) return;
    setServiceRows((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  };

  // Recurrence preview calculation
  const recurrencePreview = (() => {
    if (!recurrenceEnabled || !firstRow?.date) return null;
    const start = firstRow.date;
    let count = 0;
    let end = "";

    if (endCondition === "occurrences") {
      count = parseInt(occurrences) || 0;
      if (count <= 0) return null;
      // Estimate end date
      const d = new Date(start + "T00:00:00");
      const intervalDays = frequency === "daily" ? 1 : frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
      d.setDate(d.getDate() + intervalDays * (count - 1));
      end = d.toISOString().split("T")[0];
    } else {
      end = endDate;
      if (!end) return null;
      // Estimate count
      const s = new Date(start + "T00:00:00");
      const e = new Date(end + "T00:00:00");
      const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      const intervalDays = frequency === "daily" ? 1 : frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
      count = Math.floor(diffDays / intervalDays) + 1;
    }

    return { count, start, end };
  })();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFormError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!clientName) errors.clientName = tc("requiredField");
    const primary = serviceRows[0];
    if (!primary?.serviceId) errors.serviceId = tc("requiredField");
    if (!primary?.date) errors.date = tc("requiredField");
    if (!primary?.time) errors.time = tc("requiredField");

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(tc("requiredField"));
      const firstKey = Object.keys(errors)[0];
      setTimeout(() => {
        document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }
    setFormErrors({});

    setIsSaving(true);

    try {
      const selectedService = servicesList.find((s) => s.id === primary.serviceId);
      const selectedEmployee = employeesList.find((e) => e.id === primary.employeeId);
      const selectedDoctor = doctorsList.find((d) => d.id === primary.doctorId);

      const baseData: Partial<Appointment> = {
        clientId: clientId || undefined,
        clientName,
        clientPhone,
        serviceId: primary.serviceId || undefined,
        service: selectedService?.name || "",
        employeeId: primary.employeeId || undefined,
        employee: selectedEmployee?.name || "",
        doctorId: primary.doctorId || undefined,
        doctor: selectedDoctor?.name || undefined,
        date: primary.date,
        time: primary.time,
        duration: selectedService?.duration || 60,
        price: selectedService?.price || 0,
        notes: notes || undefined,
      };

      if (isEdit && appointmentId) {
        // Update existing appointment
        await updateAppointment.mutateAsync({
          id: appointmentId,
          data: { ...baseData, status },
        });

        // Handle additional service rows as new linked appointments
        if (serviceRows.length > 1) {
          const groupId = existingAppointment?.groupId || crypto.randomUUID();
          // Update primary with groupId
          if (!existingAppointment?.groupId) {
            await updateAppointment.mutateAsync({
              id: appointmentId,
              data: { groupId },
            });
          }
          // Create additional appointments
          for (let i = 1; i < serviceRows.length; i++) {
            const row = serviceRows[i];
            if (!row.serviceId) continue;
            const svc = servicesList.find((s) => s.id === row.serviceId);
            const emp = employeesList.find((e) => e.id === row.employeeId);
            const doc = doctorsList.find((d) => d.id === row.doctorId);
            await createAppointment.mutateAsync({
              clientId: clientId || undefined,
              clientName,
              clientPhone,
              serviceId: row.serviceId || undefined,
              service: svc?.name || "",
              employeeId: row.employeeId || undefined,
              employee: emp?.name || "",
              doctorId: row.doctorId || undefined,
              doctor: doc?.name || undefined,
              date: row.date || primary.date,
              time: row.time || primary.time,
              duration: svc?.duration || 60,
              status: "pending",
              price: svc?.price || 0,
              notes: notes || undefined,
              groupId,
            });
          }
        }

        toast.success(tc("updateSuccess"));
        router.push(`/appointments/${appointmentId}`);
      } else if (recurrenceEnabled && recurrencePreview) {
        // Create recurring appointments
        const result = await createRecurring.mutateAsync({
          appointment: baseData,
          recurrence: {
            frequency,
            interval: 1,
            ...(endCondition === "occurrences"
              ? { occurrences: parseInt(occurrences) || 4 }
              : { endDate }),
          },
        });

        const data = (result as { createdCount?: number; skippedCount?: number });
        if (data.skippedCount && data.skippedCount > 0) {
          toast.warning(t("recurringPartialSuccess", {
            created: String(data.createdCount ?? 0),
            skipped: String(data.skippedCount),
          }));
        } else {
          toast.success(tc("addSuccess"));
        }
        router.push("/appointments");
      } else {
        // Create single or multi-service appointments
        let groupId: string | undefined;

        if (serviceRows.length > 1) {
          groupId = crypto.randomUUID();
        }

        // Create primary
        const created = await createAppointment.mutateAsync({
          ...baseData,
          status: "pending",
          groupId,
        });

        // Create additional service rows
        for (let i = 1; i < serviceRows.length; i++) {
          const row = serviceRows[i];
          if (!row.serviceId) continue;
          const svc = servicesList.find((s) => s.id === row.serviceId);
          const emp = employeesList.find((e) => e.id === row.employeeId);
          const doc = doctorsList.find((d) => d.id === row.doctorId);
          await createAppointment.mutateAsync({
            clientId: clientId || undefined,
            clientName,
            clientPhone,
            serviceId: row.serviceId || undefined,
            service: svc?.name || "",
            employeeId: row.employeeId || undefined,
            employee: emp?.name || "",
            doctorId: row.doctorId || undefined,
            doctor: doc?.name || undefined,
            date: row.date || primary.date,
            time: row.time || primary.time,
            duration: svc?.duration || 60,
            status: "pending",
            price: svc?.price || 0,
            notes: notes || undefined,
            groupId,
          });
        }

        toast.success(tc("addSuccess"));
        router.push(`/appointments/${created.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"));
    } finally {
      setIsSaving(false);
    }
  };

  const isLaserService = primaryService?.serviceType === "laser";
  const isInjectableService = primaryService?.serviceType === "injectable";
  const canShowDates = !!firstRow?.serviceId;
  const canShowSlots = !!firstRow?.serviceId && !!firstRow?.date;

  const clientValue = useMemo(
    () => clientId ? { clientId, clientName, clientPhone } : null,
    [clientId, clientName, clientPhone]
  );

  const handleClientChange = useCallback((client: { clientId: string; clientName: string; clientPhone: string } | null) => {
    if (client) {
      setClientId(client.clientId);
      setClientName(client.clientName);
      setClientPhone(client.clientPhone);
    } else {
      setClientId("");
      setClientName("");
      setClientPhone("");
    }
  }, []);

  // Debounced conflict checking
  const checkForConflict = useCallback(async (
    employeeId: string,
    employeeName: string,
    doctorId: string,
    cId: string,
    date: string,
    time: string,
    duration: number,
    excludeId?: string,
  ) => {
    try {
      const res = await fetch("/api/appointments/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId || undefined,
          employee: employeeName || undefined,
          doctorId: doctorId || undefined,
          clientId: cId || undefined,
          date,
          time,
          duration,
          excludeId,
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data ?? json;
      if (data.hasConflict || data.employeeHoursWarning || data.doctorHoursWarning || data.clientConflictWarning) {
        setConflictWarning({
          hasConflict: data.hasConflict,
          conflictType: data.conflictType,
          conflictingAppointment: data.conflictingAppointment,
          nextAvailableSlot: data.nextAvailableSlot,
          employeeHoursWarning: data.employeeHoursWarning,
          doctorHoursWarning: data.doctorHoursWarning,
          clientConflictWarning: data.clientConflictWarning,
        });
      } else {
        setConflictWarning(null);
      }
    } catch {
      // Silently fail — server still validates on submit
    }
  }, []);

  useEffect(() => {
    setConflictWarning(null);
    const row = serviceRows[0];
    const selectedService = servicesList.find((s) => s.id === row?.serviceId);
    if ((!row?.employeeId && !row?.doctorId) || !row?.date || !row?.time || !row?.serviceId || !selectedService) {
      return;
    }

    const selectedEmployee = employeesList.find((e) => e.id === row.employeeId);

    clearTimeout(conflictTimerRef.current);
    conflictTimerRef.current = setTimeout(() => {
      checkForConflict(
        row.employeeId,
        selectedEmployee?.name || "",
        row.doctorId,
        clientId,
        row.date,
        row.time,
        selectedService.duration || 60,
        appointmentId,
      );
    }, 300);

    return () => clearTimeout(conflictTimerRef.current);
  }, [serviceRows[0]?.employeeId, serviceRows[0]?.doctorId, serviceRows[0]?.date, serviceRows[0]?.time, serviceRows[0]?.serviceId, clientId, servicesList, employeesList, appointmentId, checkForConflict]);

  if (isEdit && loadingAppointment) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
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
            {isEdit ? t("editAppointment") : t("newAppointment")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>{tc("cancelAction")}</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "..." : t("saveAppointment")}
          </Button>
        </div>
      </div>

      {/* Section A: Client Details */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{t("clientDetails")}</h2>

        {clientId && <ClientLeftoverBanner clientId={clientId} />}

        <FormField label={t("client")} required error={formErrors.clientName} htmlFor="clientName">
          <div data-field="clientName">
            <ClientCombobox
              value={clientValue}
              onChange={(v) => { handleClientChange(v); clearFormError("clientName"); }}
            />
          </div>
        </FormField>

        {clientPhone && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("phone")}</label>
            <Input value={clientPhone} readOnly className="font-english" dir="ltr" />
          </div>
        )}
      </div>

      {/* Section B: Services (Multi-Service) */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t("servicesSection")}</h2>
          <Button variant="outline" size="sm" onClick={addServiceRow} className="gap-1">
            <Plus className="h-3 w-3" />
            {t("addService")}
          </Button>
        </div>

        {serviceRows.map((row, index) => {
          const selectedService = servicesList.find((s) => s.id === row.serviceId);
          return (
            <div key={index} className="space-y-3 rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {index === 0 ? t("primaryService") : t("additionalService")}
                </p>
                {index > 0 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeServiceRow(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Service select */}
              <FormField label={t("service")} required={index === 0} error={index === 0 ? formErrors.serviceId : undefined}>
                <div data-field="serviceId">
                  <Select
                    value={row.serviceId}
                    onValueChange={(v) => { updateServiceRow(index, { serviceId: v, date: "", time: "" }); if (index === 0) clearFormError("serviceId"); }}
                  >
                    <SelectTrigger className="w-full" aria-invalid={index === 0 && !!formErrors.serviceId}>
                      <SelectValue placeholder={t("selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesList.map((svc) => (
                        <SelectItem key={svc.id} value={svc.id}>{svc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormField>

              {/* Employee select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("employee")}</label>
                <Select
                  value={row.employeeId || ""}
                  onValueChange={(v) => updateServiceRow(index, { employeeId: v === CLEAR_VALUE ? "" : v, date: "", time: "" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {row.employeeId && (
                      <SelectItem value={CLEAR_VALUE} className="text-muted-foreground">{t("clearSelection")}</SelectItem>
                    )}
                    {employeesList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("doctor")}</label>
                <Select
                  value={row.doctorId || ""}
                  onValueChange={(v) => updateServiceRow(index, { doctorId: v === CLEAR_VALUE ? "" : v, date: "", time: "" })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectDoctor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {row.doctorId && (
                      <SelectItem value={CLEAR_VALUE} className="text-muted-foreground">{t("clearSelection")}</SelectItem>
                    )}
                    {doctorsList.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price & Duration (read-only) */}
              {selectedService && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("price")}</p>
                    <p className="text-sm font-medium font-english"><span className="text-foreground">{selectedService.price}</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("duration")}</p>
                    <p className="text-sm font-medium font-english text-foreground">{selectedService.duration} {t("minutes")}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section C: Schedule */}
      <div className={`rounded-lg border bg-card p-6 space-y-4 ${formErrors.date || formErrors.time ? "border-destructive" : "border-border"}`} data-field="date">
        <h2 className="text-sm font-semibold text-foreground">{t("scheduleSection")}</h2>
        {(formErrors.date || formErrors.time) && (
          <p className="text-xs text-destructive">{tc("requiredField")}</p>
        )}

        {/* Available Dates */}
        {!manualTimeMode && canShowDates && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("availableDates")}</label>
            {datesLoading ? (
              <p className="text-sm text-muted-foreground">{t("loadingDates")}</p>
            ) : availableDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noAvailableDates")}</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto">
                {availableDates.map((dateStr) => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => updateServiceRow(0, { date: dateStr, time: "" })}
                    className={`rounded-md border px-2 py-2 text-xs font-english transition-colors ${
                      firstRow?.date === dateStr
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {formatDateLabel(dateStr)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual date input */}
        {manualTimeMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("date")}</label>
            <Input
              type="date"
              value={firstRow?.date || ""}
              onChange={(e) => updateServiceRow(0, { date: e.target.value, time: "" })}
              className="font-english"
            />
          </div>
        )}

        {/* Available Time Slots */}
        {!manualTimeMode && canShowSlots && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("availableSlots")}</label>
            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">{t("loadingSlots")}</p>
            ) : uniqueSlotTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noAvailableSlots")}</p>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
                {uniqueSlotTimes.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => updateServiceRow(0, { time: slot.time })}
                    className={`rounded-md border px-2 py-2 text-sm font-english transition-colors ${
                      firstRow?.time === slot.time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual time input */}
        {manualTimeMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("time")}</label>
            <Input
              type="time"
              value={firstRow?.time || ""}
              onChange={(e) => updateServiceRow(0, { time: e.target.value })}
              className="font-english"
            />
          </div>
        )}

        {/* Toggle manual/slot mode */}
        {canShowDates && (
          <button
            type="button"
            className="text-xs text-muted-foreground underline hover:no-underline"
            onClick={() => {
              setManualTimeMode((prev) => !prev);
              updateServiceRow(0, { date: "", time: "" });
            }}
          >
            {manualTimeMode ? t("slotPickerMode") : t("manualTimeEntry")}
          </button>
        )}

        {/* Conflict warnings */}
        {conflictWarning?.hasConflict && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            <p>
              {conflictWarning.conflictType === "doctor"
                ? t("doctorConflictWarning", {
                    time: conflictWarning.conflictingAppointment?.time ?? "",
                    service: conflictWarning.conflictingAppointment?.service ?? "",
                  })
                : t("conflictWarning", {
                    time: conflictWarning.conflictingAppointment?.time ?? "",
                    service: conflictWarning.conflictingAppointment?.service ?? "",
                  })
              }
            </p>
            {conflictWarning.nextAvailableSlot && (
              <p className="mt-1">
                <button
                  type="button"
                  className="font-medium underline hover:no-underline"
                  onClick={() => updateServiceRow(0, { time: conflictWarning.nextAvailableSlot! })}
                >
                  {t("nextAvailable", { time: conflictWarning.nextAvailableSlot })}
                </button>
              </p>
            )}
          </div>
        )}

        {conflictWarning?.employeeHoursWarning && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            <p>
              {t("outsideEmployeeHours", {
                start: conflictWarning.employeeHoursWarning.start,
                end: conflictWarning.employeeHoursWarning.end,
              })}
            </p>
          </div>
        )}

        {conflictWarning?.doctorHoursWarning && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            <p>
              {t("outsideDoctorHours", {
                start: conflictWarning.doctorHoursWarning.start,
                end: conflictWarning.doctorHoursWarning.end,
              })}
            </p>
          </div>
        )}

        {conflictWarning?.clientConflictWarning && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
            <p>
              {t("clientConflictWarning", {
                time: conflictWarning.clientConflictWarning.time,
                service: conflictWarning.clientConflictWarning.service,
              })}
            </p>
          </div>
        )}
      </div>

      {/* Section D: Photo Attachments */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{t("photosSection")}</h2>
        {isEdit && appointmentId ? (
          <AppointmentPhotoUploader appointmentId={appointmentId} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("savePhotosAfterCreate")}</p>
        )}
      </div>

      {/* Section E: Recurrence */}
      {!isEdit && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <h2 className="text-sm font-semibold text-foreground">{t("recurrenceSection")}</h2>
            <Checkbox checked={recurrenceEnabled} onCheckedChange={(checked) => setRecurrenceEnabled(!!checked)} />
          </label>
          <p className="text-xs text-muted-foreground">{t("repeatAppointment")}</p>

          {recurrenceEnabled && (
            <div className="space-y-4">
              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("frequency")}</label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("frequencyDaily")}</SelectItem>
                    <SelectItem value="weekly">{t("frequencyWeekly")}</SelectItem>
                    <SelectItem value="biweekly">{t("frequencyBiweekly")}</SelectItem>
                    <SelectItem value="monthly">{t("frequencyMonthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* End condition */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("endCondition")}</label>
                <Select value={endCondition} onValueChange={(v) => setEndCondition(v as "occurrences" | "date")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occurrences">{t("occurrences")}</SelectItem>
                    <SelectItem value="date">{t("endByDate")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {endCondition === "occurrences" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("occurrences")}</label>
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={occurrences}
                    onChange={(e) => setOccurrences(e.target.value)}
                    className="font-english"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("endByDate")}</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="font-english"
                  />
                </div>
              )}

              {/* Preview */}
              {recurrencePreview && (
                <p className="text-sm text-muted-foreground font-english">
                  {t("recurrencePreview", {
                    count: recurrencePreview.count,
                    start: recurrencePreview.start,
                    end: recurrencePreview.end,
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section F: Status & Consumption (edit mode only) */}
      {isEdit && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{t("statusConsumption")}</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("status")}</label>
            <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{t(STATUS_KEYS[s] as "statusConfirmed")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consumption buttons */}
          {(isLaserService || isInjectableService) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">{tct("recordConsumption")}</p>
              <div className="flex flex-wrap gap-2">
                {isLaserService && (
                  <Button variant="outline" size="sm" onClick={() => setLaserSheetOpen(true)} className="gap-2">
                    <Zap className="h-4 w-4" />
                    {tct("recordLaserShots")}
                  </Button>
                )}
                {isInjectableService && (
                  <Button variant="outline" size="sm" onClick={() => setInjectableSheetOpen(true)} className="gap-2">
                    <Syringe className="h-4 w-4" />
                    {tct("recordInjectableConsumption")}
                  </Button>
                )}
              </div>

              {consumptionLogs.length > 0 && (
                <div className="space-y-2">
                  {consumptionLogs.map((log) => (
                    <div key={log.id} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                      {log.consumptionType === "laser_shots" ? (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span className="font-english">{log.actualShots} {tct("shots")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-blue-500" />
                          <span>{log.productName}</span>
                          <span className="font-english">{log.amountUsed}/{log.totalAllocated} {log.unit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section G: Notes */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{t("notes")}</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          rows={3}
        />
      </div>

      {/* Bottom save buttons */}
      <div className="flex items-center justify-end gap-2 pb-6">
        <Button variant="outline" onClick={() => router.back()}>{tc("cancelAction")}</Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "..." : t("saveAppointment")}
        </Button>
      </div>

      {/* Consumption sheets */}
      {isEdit && isLaserService && existingAppointment && (
        <LaserConsumptionSheet
          open={laserSheetOpen}
          onOpenChange={setLaserSheetOpen}
          appointment={existingAppointment}
          service={primaryService}
        />
      )}
      {isEdit && isInjectableService && existingAppointment && (
        <InjectableConsumptionSheet
          open={injectableSheetOpen}
          onOpenChange={setInjectableSheetOpen}
          appointment={existingAppointment}
          service={primaryService}
        />
      )}
    </div>
  );
}
