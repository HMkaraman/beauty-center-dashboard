"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkingHours, useUpdateWorkingHours } from "@/lib/hooks/use-settings";

interface DaySchedule {
  day: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DAY_NAMES = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: "saturday", dayOfWeek: 0, isOpen: true, openTime: "09:00", closeTime: "21:00" },
  { day: "sunday", dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "21:00" },
  { day: "monday", dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "21:00" },
  { day: "tuesday", dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "21:00" },
  { day: "wednesday", dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "21:00" },
  { day: "thursday", dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "friday", dayOfWeek: 6, isOpen: false, openTime: "09:00", closeTime: "21:00" },
];

export function WorkingHoursCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: workingHoursData, isLoading } = useWorkingHours();
  const updateWorkingHours = useUpdateWorkingHours();

  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);

  useEffect(() => {
    if (workingHoursData && Array.isArray(workingHoursData) && workingHoursData.length > 0) {
      const mapped = workingHoursData.map((wh) => ({
        day: DAY_NAMES[wh.dayOfWeek ?? 0] || "saturday",
        dayOfWeek: wh.dayOfWeek ?? 0,
        isOpen: !!wh.isOpen,
        openTime: wh.startTime || "09:00",
        closeTime: wh.endTime || "21:00",
      }));
      mapped.sort((a: DaySchedule, b: DaySchedule) => a.dayOfWeek - b.dayOfWeek);
      setSchedule(mapped);
    }
  }, [workingHoursData]);

  const updateDay = (index: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...updates } : d)));
  };

  const handleSave = () => {
    const payload = schedule.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      startTime: day.openTime,
      endTime: day.closeTime,
      isOpen: day.isOpen,
    }));
    updateWorkingHours.mutate(payload, {
      onSuccess: () => toast.success(tc("updateSuccess")),
      onError: () => toast.error(tc("error")),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">{t("workingHours")}</h3>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("workingHours")}</h3>
      <div className="space-y-3">
        <div className="hidden sm:grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
          <span>{t("day")}</span>
          <span>{t("open")}</span>
          <span>{t("openTime")}</span>
          <span>{t("closeTime")}</span>
        </div>
        {schedule.map((day, index) => (
          <div key={day.day} className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center py-2">
            <span className="text-sm text-foreground">{t(day.day)}</span>
            <div>
              <button
                onClick={() => updateDay(index, { isOpen: !day.isOpen })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${day.isOpen ? "bg-green-500" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${day.isOpen ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"}`} />
              </button>
            </div>
            <Input
              type="time"
              value={day.openTime}
              onChange={(e) => updateDay(index, { openTime: e.target.value })}
              disabled={!day.isOpen}
              className="font-english text-xs"
            />
            <Input
              type="time"
              value={day.closeTime}
              onChange={(e) => updateDay(index, { closeTime: e.target.value })}
              disabled={!day.isOpen}
              className="font-english text-xs"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={updateWorkingHours.isPending}>
          {updateWorkingHours.isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
