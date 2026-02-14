"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export function WorkingHoursCard() {
  const t = useTranslations("settings");
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "sunday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "monday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "friday", isOpen: false, openTime: "09:00", closeTime: "21:00" },
  ]);

  const updateDay = (index: number, updates: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, ...updates } : d)));
  };

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
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  );
}
