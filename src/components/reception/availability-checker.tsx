"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import { useProviderSchedule } from "@/lib/hooks/use-reception";
import { ScheduleTimeline } from "./schedule-timeline";

interface AvailabilityCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvailabilityChecker({ open, onOpenChange }: AvailabilityCheckerProps) {
  const t = useTranslations("reception");

  const [tab, setTab] = useState<"employees" | "doctors">("employees");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: employeesData } = useEmployees({ limit: 200 });
  const allEmployees = (employeesData?.data ?? []).filter((e) => e.status === "active");
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allDoctors = (doctorsData?.data ?? []).filter((d) => d.status === "active");

  const scheduleParams =
    tab === "employees"
      ? { date, employeeId: selectedEmployeeId || undefined }
      : { date, doctorId: selectedDoctorId || undefined };

  const { data: scheduleData, isLoading } = useProviderSchedule(scheduleParams);

  const hasSelection =
    (tab === "employees" && !!selectedEmployeeId) ||
    (tab === "doctors" && !!selectedDoctorId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("providerSchedule")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("checkAvailability")}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-4 mt-4">
          {/* Tabs */}
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "employees" | "doctors");
              setSelectedEmployeeId("");
              setSelectedDoctorId("");
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="employees" className="flex-1">
                {t("employee")}
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex-1">
                {t("doctor")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-3 mt-3">
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectProvider")} />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="doctors" className="space-y-3 mt-3">
              <Select
                value={selectedDoctorId}
                onValueChange={setSelectedDoctorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectProvider")} />
                </SelectTrigger>
                <SelectContent>
                  {allDoctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>

          {/* Date picker */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t("selectDate")}</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="font-english"
            />
          </div>

          {/* Schedule display */}
          {hasSelection && (
            <div className="pt-2">
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-8">...</p>
              ) : scheduleData?.notWorking ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">{t("notWorkingToday")}</p>
                </div>
              ) : scheduleData?.workingHours ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("schedule")}</span>
                    <span className="font-english">
                      {scheduleData.workingHours.start} - {scheduleData.workingHours.end}
                    </span>
                  </div>
                  <ScheduleTimeline
                    workingHours={scheduleData.workingHours}
                    appointments={scheduleData.appointments}
                  />
                </div>
              ) : null}
            </div>
          )}

          {!hasSelection && (
            <p className="text-xs text-muted-foreground text-center py-8">
              {t("selectProvider")}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
