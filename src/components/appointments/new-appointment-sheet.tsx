"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useServices } from "@/lib/hooks/use-services";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import {
  useCreateAppointment,
  useUpdateAppointment,
  useAvailableSlots,
  useAvailableDates,
} from "@/lib/hooks/use-appointments";
import { Appointment } from "@/types";
import { ClientCombobox } from "./client-combobox";

interface NewAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Appointment | null;
}

const emptyForm = {
  clientId: "",
  clientName: "",
  clientPhone: "",
  serviceId: "",
  employeeId: "",
  doctorId: "",
  date: "",
  time: "",
  notes: "",
};

const CLEAR_VALUE = "__clear__";

export function NewAppointmentSheet({ open, onOpenChange, editItem }: NewAppointmentSheetProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const { data: servicesData } = useServices({ limit: 100 });
  const { data: employeesData } = useEmployees({ limit: 100 });
  const { data: doctorsData } = useDoctors({ limit: 100 });
  const services = servicesData?.data ?? [];
  const employees = employeesData?.data ?? [];
  const doctorsList = doctorsData?.data ?? [];

  const [form, setForm] = useState(emptyForm);
  const [manualTimeMode, setManualTimeMode] = useState(false);

  // Conflict warning state (only used in manual time mode)
  const [conflictWarning, setConflictWarning] = useState<{
    hasConflict: boolean;
    conflictType?: "employee" | "doctor";
    conflictingAppointment?: { time: string; service: string };
    nextAvailableSlot?: string | null;
    employeeHoursWarning?: { start: string; end: string } | null;
    doctorHoursWarning?: { start: string; end: string } | null;
  } | null>(null);
  const conflictTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Available dates query
  const { data: datesData, isLoading: datesLoading } = useAvailableDates({
    serviceId: form.serviceId || undefined,
    employeeId: form.employeeId || undefined,
    doctorId: form.doctorId || undefined,
    excludeId: editItem?.id,
  });
  const availableDates = datesData?.dates ?? [];

  // Available slots query
  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots({
    date: form.date || undefined,
    serviceId: form.serviceId || undefined,
    employeeId: form.employeeId || undefined,
    doctorId: form.doctorId || undefined,
    excludeId: editItem?.id,
  });
  const availableSlots = slotsData?.slots ?? [];

  // Deduplicate slots by time for display (when no specific employee, multiple employees may share a time)
  const uniqueSlotTimes = availableSlots.reduce<Array<{ time: string; employeeId: string; employeeName: string }>>((acc, slot) => {
    if (!acc.some((s) => s.time === slot.time)) {
      acc.push(slot);
    }
    return acc;
  }, []);

  useEffect(() => {
    if (editItem) {
      const matchedService = services.find((s) => s.name === editItem.service);
      const matchedEmployee = employees.find((e) => e.name === editItem.employee);
      setForm({
        clientId: editItem.clientId || "",
        clientName: editItem.clientName,
        clientPhone: editItem.clientPhone,
        serviceId: matchedService?.id || "",
        employeeId: matchedEmployee?.id || "",
        doctorId: editItem.doctorId || "",
        date: editItem.date,
        time: editItem.time,
        notes: editItem.notes || "",
      });
    } else {
      setForm(emptyForm);
      setManualTimeMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem?.id, open, services.length, employees.length, doctorsList.length]);

  // Clear date + time when service/employee/doctor changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, date: "", time: "" }));
    setConflictWarning(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.serviceId, form.employeeId, form.doctorId]);

  // Proactive conflict check — only in manual time mode
  const checkForConflict = useCallback(async (
    employeeId: string,
    employeeName: string,
    doctorId: string,
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
          date,
          time,
          duration,
          excludeId,
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data ?? json;
      if (data.hasConflict || data.employeeHoursWarning || data.doctorHoursWarning) {
        setConflictWarning({
          hasConflict: data.hasConflict,
          conflictType: data.conflictType,
          conflictingAppointment: data.conflictingAppointment,
          nextAvailableSlot: data.nextAvailableSlot,
          employeeHoursWarning: data.employeeHoursWarning,
          doctorHoursWarning: data.doctorHoursWarning,
        });
      } else {
        setConflictWarning(null);
      }
    } catch {
      // Silently fail — server still validates on submit
    }
  }, []);

  // Conflict check effect — only active in manual time mode
  useEffect(() => {
    if (!manualTimeMode) {
      setConflictWarning(null);
      return;
    }

    setConflictWarning(null);
    const selectedService = services.find((s) => s.id === form.serviceId);
    if ((!form.employeeId && !form.doctorId) || !form.date || !form.time || !form.serviceId || !selectedService) {
      return;
    }

    const selectedEmployee = employees.find((e) => e.id === form.employeeId);

    clearTimeout(conflictTimerRef.current);
    conflictTimerRef.current = setTimeout(() => {
      checkForConflict(
        form.employeeId,
        selectedEmployee?.name || "",
        form.doctorId,
        form.date,
        form.time,
        selectedService.duration || 60,
        editItem?.id,
      );
    }, 300);

    return () => clearTimeout(conflictTimerRef.current);
  }, [manualTimeMode, form.employeeId, form.doctorId, form.date, form.time, form.serviceId, services, employees, editItem?.id, checkForConflict]);

  const handleSubmit = () => {
    if (!form.clientName || !form.serviceId || !form.date || !form.time) {
      toast.error(tc("requiredField"));
      return;
    }

    const selectedService = services.find((s) => s.id === form.serviceId);
    const selectedEmployee = employees.find((e) => e.id === form.employeeId);
    const selectedDoctor = doctorsList.find((d) => d.id === form.doctorId);

    if (editItem) {
      updateAppointment.mutate({ id: editItem.id, data: {
        clientId: form.clientId || undefined,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        service: selectedService?.name || editItem.service,
        employee: selectedEmployee?.name || "",
        employeeId: form.employeeId || undefined,
        doctor: selectedDoctor?.name || undefined,
        doctorId: form.doctorId || undefined,
        date: form.date,
        time: form.time,
        notes: form.notes || undefined,
        duration: selectedService?.duration || editItem.duration,
        price: selectedService?.price || editItem.price,
      } }, { onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); } });
    } else {
      createAppointment.mutate({
        clientId: form.clientId || undefined,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        service: selectedService?.name || "",
        employee: selectedEmployee?.name || "",
        employeeId: form.employeeId || undefined,
        doctor: selectedDoctor?.name || undefined,
        doctorId: form.doctorId || undefined,
        date: form.date,
        time: form.time,
        duration: selectedService?.duration || 60,
        status: "pending",
        price: selectedService?.price || 0,
        notes: form.notes || undefined,
      }, { onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); } });
    }
    return;
  };

  const clientValue = form.clientId
    ? { clientId: form.clientId, clientName: form.clientName, clientPhone: form.clientPhone }
    : null;

  const canShowDates = !!form.serviceId;
  const canShowSlots = !!form.serviceId && !!form.date;

  // Format date for display: "Wed 19 Feb"
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newAppointment")}</SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? tc("editItem") : t("newAppointment")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          {/* Client */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("client")}</label>
            <ClientCombobox
              value={clientValue}
              onChange={(client) => {
                if (client) {
                  setForm({
                    ...form,
                    clientId: client.clientId,
                    clientName: client.clientName,
                    clientPhone: client.clientPhone,
                  });
                } else {
                  setForm({ ...form, clientId: "", clientName: "", clientPhone: "" });
                }
              }}
            />
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("service")}</label>
            <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v, date: "", time: "" })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectService")} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("employee")}</label>
            <Select
              value={form.employeeId || ""}
              onValueChange={(v) => setForm({ ...form, employeeId: v === CLEAR_VALUE ? "" : v, date: "", time: "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {form.employeeId && (
                  <SelectItem value={CLEAR_VALUE} className="text-muted-foreground">
                    {t("clearSelection")}
                  </SelectItem>
                )}
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("doctor")}</label>
            <Select
              value={form.doctorId || ""}
              onValueChange={(v) => setForm({ ...form, doctorId: v === CLEAR_VALUE ? "" : v, date: "", time: "" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectDoctor")} />
              </SelectTrigger>
              <SelectContent>
                {form.doctorId && (
                  <SelectItem value={CLEAR_VALUE} className="text-muted-foreground">
                    {t("clearSelection")}
                  </SelectItem>
                )}
                {doctorsList.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Available Dates */}
          {!manualTimeMode && canShowDates && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("availableDates")}</label>
              {datesLoading ? (
                <p className="text-sm text-muted-foreground">{t("loadingDates")}</p>
              ) : availableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noAvailableDates")}</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto">
                  {availableDates.map((dateStr) => (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setForm({ ...form, date: dateStr, time: "" })}
                      className={`rounded-md border px-2 py-2 text-xs font-english transition-colors ${
                        form.date === dateStr
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

          {/* Manual date input (only in manual mode) */}
          {manualTimeMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("date")}</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })}
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
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                  {uniqueSlotTimes.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setForm({ ...form, time: slot.time })}
                      className={`rounded-md border px-2 py-2 text-sm font-english transition-colors ${
                        form.time === slot.time
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

          {/* Manual time input (only in manual mode) */}
          {manualTimeMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("time")}</label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
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
                setForm((prev) => ({ ...prev, date: "", time: "" }));
              }}
            >
              {manualTimeMode ? t("slotPickerMode") : t("manualTimeEntry")}
            </button>
          )}

          {/* Conflict warnings (manual mode only) */}
          {manualTimeMode && conflictWarning?.hasConflict && (
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
                    onClick={() => setForm({ ...form, time: conflictWarning.nextAvailableSlot! })}
                  >
                    {t("nextAvailable", { time: conflictWarning.nextAvailableSlot })}
                  </button>
                </p>
              )}
            </div>
          )}

          {manualTimeMode && conflictWarning?.employeeHoursWarning && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
              <p>
                {t("outsideEmployeeHours", {
                  start: conflictWarning.employeeHoursWarning.start,
                  end: conflictWarning.employeeHoursWarning.end,
                })}
              </p>
            </div>
          )}

          {manualTimeMode && conflictWarning?.doctorHoursWarning && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
              <p>
                {t("outsideDoctorHours", {
                  start: conflictWarning.doctorHoursWarning.start,
                  end: conflictWarning.doctorHoursWarning.end,
                })}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("notesPlaceholder")}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
