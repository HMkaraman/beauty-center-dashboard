"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { useSections } from "@/lib/hooks/use-sections";
import { useAvailableSlots } from "@/lib/hooks/use-appointments";
import type { SelectedService } from "./service-browser";

interface ServiceAssignment {
  service: SelectedService;
  employeeId: string;
  employeeName: string;
  doctorId: string;
  doctorName: string;
  time: string;
}

interface BookingStepProviderTimeProps {
  assignments: ServiceAssignment[];
  onUpdateAssignment: (serviceId: string, field: string, value: string) => void;
}

function TimeSlotPicker({
  serviceId,
  employeeId,
  doctorId,
  selectedTime,
  onSelectTime,
}: {
  serviceId: string;
  employeeId?: string;
  doctorId?: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
}) {
  const t = useTranslations("reception");
  const [useCustom, setUseCustom] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const hasProvider = !!employeeId || !!doctorId;

  const { data: slotsData, isLoading } = useAvailableSlots({
    date: today,
    serviceId: hasProvider ? serviceId : undefined,
    employeeId: employeeId || undefined,
    doctorId: doctorId || undefined,
  });

  const slots = slotsData?.slots ?? [];

  // Find the nearest available slot to current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!hasProvider) {
    return (
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">{t("time")}</label>
        <p className="text-xs text-muted-foreground italic">{t("selectProviderFirst")}</p>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => onSelectTime(e.target.value)}
          className="font-english"
        />
      </div>
    );
  }

  if (useCustom) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">{t("time")}</label>
          <button
            type="button"
            onClick={() => setUseCustom(false)}
            className="text-xs text-primary hover:underline"
          >
            {t("availableSlots")}
          </button>
        </div>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => onSelectTime(e.target.value)}
          className="font-english"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{t("availableSlots")}</label>
        <button
          type="button"
          onClick={() => setUseCustom(true)}
          className="text-xs text-primary hover:underline"
        >
          {t("customTime")}
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">...</p>
      ) : slots.length === 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground italic">{t("noSlotsAvailable")}</p>
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => onSelectTime(e.target.value)}
            className="font-english"
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectTime(slot.time)}
              className={`rounded-full px-3 py-1 text-xs font-english border transition-colors ${
                selectedTime === slot.time
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border hover:border-primary"
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BookingStepProviderTime({
  assignments,
  onUpdateAssignment,
}: BookingStepProviderTimeProps) {
  const t = useTranslations("reception");

  const { data: employeesData } = useEmployees({ limit: 200 });
  const allEmployees = employeesData?.data ?? [];
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allDoctors = doctorsData?.data ?? [];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("assignProviders")}</h3>
      {assignments.map((assignment) => (
        <div
          key={assignment.service.serviceId}
          className="rounded-lg border border-border p-4 space-y-4"
        >
          <p className="text-sm font-medium">{assignment.service.name}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee select */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">{t("employee")}</label>
              <Select
                value={assignment.employeeId}
                onValueChange={(v) =>
                  onUpdateAssignment(assignment.service.serviceId, "employeeId", v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectEmployee")} />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor select */}
            {allDoctors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{t("doctor")}</label>
                <Select
                  value={assignment.doctorId}
                  onValueChange={(v) =>
                    onUpdateAssignment(assignment.service.serviceId, "doctorId", v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectDoctor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {allDoctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Time slot picker */}
          <TimeSlotPicker
            serviceId={assignment.service.serviceId}
            employeeId={assignment.employeeId || undefined}
            doctorId={assignment.doctorId || undefined}
            selectedTime={assignment.time}
            onSelectTime={(time) =>
              onUpdateAssignment(assignment.service.serviceId, "time", time)
            }
          />
        </div>
      ))}
    </div>
  );
}

export type { ServiceAssignment };
