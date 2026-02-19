"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDoctorSchedules, useUpdateDoctorSchedules } from "@/lib/hooks/use-doctors";

interface DoctorScheduleCardProps {
  doctorId: string;
}

// Day labels: 0=Saturday...6=Friday (matching app convention)
const DAY_KEYS = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;

interface ScheduleEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: number;
}

const DEFAULT_SCHEDULE: ScheduleEntry[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime: "17:00",
  isAvailable: i >= 1 && i <= 5 ? 1 : 0, // Mon-Thu available by default
}));

export function DoctorScheduleCard({ doctorId }: DoctorScheduleCardProps) {
  const t = useTranslations("doctors");
  const tDays = useTranslations("settings");
  const { data: schedulesData, isLoading } = useDoctorSchedules(doctorId);
  const updateSchedules = useUpdateDoctorSchedules();

  const [schedule, setSchedule] = useState<ScheduleEntry[]>(DEFAULT_SCHEDULE);

  useEffect(() => {
    if (schedulesData) {
      const data = (schedulesData as unknown as { data?: ScheduleEntry[] })?.data ?? schedulesData;
      if (Array.isArray(data) && data.length === 7) {
        const sorted = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        setSchedule(sorted);
      }
    }
  }, [schedulesData]);

  const handleToggle = (dayOfWeek: number, checked: boolean) => {
    setSchedule((prev) =>
      prev.map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? { ...entry, isAvailable: checked ? 1 : 0 }
          : entry
      )
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) =>
      prev.map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const handleSave = () => {
    updateSchedules.mutate(
      { id: doctorId, data: schedule },
      {
        onSuccess: () => {
          toast.success(t("scheduleSaved"));
        },
        onError: () => {
          toast.error("Failed to save schedule");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-48 rounded bg-secondary/50 mb-4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-secondary/50 mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t("scheduleTitle")}</h3>
        <Button onClick={handleSave} disabled={updateSchedules.isPending} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          {t("save")}
        </Button>
      </div>

      <div className="space-y-3">
        {schedule.map((entry) => (
          <div
            key={entry.dayOfWeek}
            className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-3 min-w-[140px]">
              <Checkbox
                checked={!!entry.isAvailable}
                onCheckedChange={(checked) => handleToggle(entry.dayOfWeek, !!checked)}
              />
              <span className="text-sm font-medium text-foreground">
                {tDays(DAY_KEYS[entry.dayOfWeek])}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Input
                type="time"
                value={entry.startTime}
                onChange={(e) => handleTimeChange(entry.dayOfWeek, "startTime", e.target.value)}
                disabled={!entry.isAvailable}
                className="font-english w-[120px]"
              />
              <span className="text-sm text-muted-foreground">-</span>
              <Input
                type="time"
                value={entry.endTime}
                onChange={(e) => handleTimeChange(entry.dayOfWeek, "endTime", e.target.value)}
                disabled={!entry.isAvailable}
                className="font-english w-[120px]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
