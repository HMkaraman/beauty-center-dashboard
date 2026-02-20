"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ScheduleAppointment {
  id: string;
  time: string;
  duration: number;
  clientName: string;
  service: string;
  status: string;
}

interface ScheduleTimelineProps {
  workingHours: { start: string; end: string };
  appointments: ScheduleAppointment[];
  showCurrentTime?: boolean;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-slate-400",
  pending: "bg-slate-400",
  waiting: "bg-amber-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
};

interface FreeSlot {
  startMin: number;
  endMin: number;
  duration: number;
}

export function ScheduleTimeline({
  workingHours,
  appointments,
  showCurrentTime = false,
}: ScheduleTimelineProps) {
  const t = useTranslations("reception");

  const { startMin, endMin, totalMin } = useMemo(() => {
    const s = timeToMinutes(workingHours.start);
    const e = timeToMinutes(workingHours.end);
    return { startMin: s, endMin: e, totalMin: e - s };
  }, [workingHours]);

  // Generate hour labels
  const hourLabels = useMemo(() => {
    const labels: string[] = [];
    const startHour = Math.ceil(startMin / 60);
    const endHour = Math.floor(endMin / 60);
    for (let h = startHour; h <= endHour; h++) {
      labels.push(`${String(h).padStart(2, "0")}:00`);
    }
    return labels;
  }, [startMin, endMin]);

  // Sort appointments by time
  const sortedAppts = useMemo(
    () => [...appointments].sort((a, b) => a.time.localeCompare(b.time)),
    [appointments]
  );

  // Compute free slots between appointments
  const freeSlots = useMemo<FreeSlot[]>(() => {
    if (sortedAppts.length === 0) {
      return [{ startMin, endMin, duration: endMin - startMin }];
    }

    const slots: FreeSlot[] = [];
    let cursor = startMin;

    for (const appt of sortedAppts) {
      const apptStart = timeToMinutes(appt.time);
      const apptEnd = apptStart + appt.duration;
      if (apptStart > cursor) {
        slots.push({
          startMin: cursor,
          endMin: apptStart,
          duration: apptStart - cursor,
        });
      }
      cursor = Math.max(cursor, apptEnd);
    }

    if (cursor < endMin) {
      slots.push({
        startMin: cursor,
        endMin: endMin,
        duration: endMin - cursor,
      });
    }

    // Filter out very small gaps (< 5 minutes)
    return slots.filter((s) => s.duration >= 5);
  }, [sortedAppts, startMin, endMin]);

  // Current time tracking (updates every 60s)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    if (!showCurrentTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, [showCurrentTime]);

  const showTimeLine =
    showCurrentTime && nowMinutes >= startMin && nowMinutes <= endMin;
  const nowPct = showTimeLine
    ? ((nowMinutes - startMin) / totalMin) * 100
    : 0;

  if (totalMin <= 0) return null;

  return (
    <div className="space-y-4">
      {/* Timeline bar */}
      <div className="space-y-1">
        {/* Hour labels */}
        <div className="relative h-5">
          {hourLabels.map((label) => {
            const mins = timeToMinutes(label);
            const pct = ((mins - startMin) / totalMin) * 100;
            return (
              <span
                key={label}
                className="absolute text-[10px] font-english text-muted-foreground -translate-x-1/2"
                style={{ insetInlineStart: `${pct}%` }}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Bar */}
        <div className="relative h-14 rounded-md bg-muted/40 border border-border overflow-hidden">
          {/* Free slot blocks */}
          {freeSlots.map((slot, i) => {
            const leftPct = ((slot.startMin - startMin) / totalMin) * 100;
            const widthPct = (slot.duration / totalMin) * 100;
            return (
              <div
                key={`free-${i}`}
                className="absolute top-1 bottom-1 rounded-sm bg-green-200 dark:bg-green-900/40 flex items-center justify-center"
                style={{
                  insetInlineStart: `${leftPct}%`,
                  width: `${widthPct}%`,
                }}
              >
                {widthPct > 8 && (
                  <span className="text-[9px] font-english text-green-700 dark:text-green-400 whitespace-nowrap">
                    {slot.duration}{t("min")}
                  </span>
                )}
              </div>
            );
          })}

          {/* Appointment blocks */}
          {sortedAppts.map((appt) => {
            const apptStart = timeToMinutes(appt.time);
            const leftPct = Math.max(
              0,
              ((apptStart - startMin) / totalMin) * 100
            );
            const widthPct = Math.min(
              100 - leftPct,
              (appt.duration / totalMin) * 100
            );

            return (
              <Popover key={appt.id}>
                <PopoverTrigger asChild>
                  <button
                    className={`absolute top-1 bottom-1 rounded-sm ${
                      STATUS_COLORS[appt.status] ?? "bg-slate-400"
                    } opacity-85 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{
                      insetInlineStart: `${leftPct}%`,
                      width: `${Math.max(widthPct, 0.5)}%`,
                    }}
                  />
                </PopoverTrigger>
                <PopoverContent side="top" className="w-auto p-3">
                  <div className="text-xs space-y-0.5">
                    <p className="font-medium">{appt.clientName}</p>
                    <p className="text-muted-foreground">{appt.service}</p>
                    <p className="font-english text-muted-foreground">
                      {appt.time} ({appt.duration}{t("min")})
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}

          {/* Current time indicator */}
          {showTimeLine && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ insetInlineStart: `${nowPct}%` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}
        </div>
      </div>

      {/* Detail list */}
      {sortedAppts.length > 0 && (
        <div className="space-y-1.5">
          {sortedAppts.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                  STATUS_COLORS[appt.status] ?? "bg-slate-400"
                }`}
              />
              <span className="font-english shrink-0 text-muted-foreground">
                {appt.time}
              </span>
              <span className="truncate font-medium">{appt.clientName}</span>
              <span className="truncate text-muted-foreground">
                {appt.service}
              </span>
              <span className="font-english text-muted-foreground shrink-0">
                {appt.duration}{t("min")}
              </span>
            </div>
          ))}
        </div>
      )}

      {sortedAppts.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t("noAppointments")}
        </p>
      )}
    </div>
  );
}

// Export for use in availability-checker summary
export { timeToMinutes, minutesToTime, type ScheduleAppointment, type FreeSlot };
