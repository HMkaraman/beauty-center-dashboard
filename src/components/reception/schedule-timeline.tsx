"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-slate-400",
  pending: "bg-slate-400",
  waiting: "bg-amber-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
};

export function ScheduleTimeline({
  workingHours,
  appointments,
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

  if (totalMin <= 0) return null;

  return (
    <TooltipProvider>
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
                  style={{ left: `${pct}%` }}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* Bar */}
          <div className="relative h-10 rounded-md bg-green-100 dark:bg-green-950/30 border border-border overflow-hidden">
            {sortedAppts.map((appt) => {
              const apptStart = timeToMinutes(appt.time);
              const apptEnd = apptStart + appt.duration;
              const leftPct = Math.max(0, ((apptStart - startMin) / totalMin) * 100);
              const widthPct = Math.min(
                100 - leftPct,
                (appt.duration / totalMin) * 100
              );

              return (
                <Tooltip key={appt.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute top-1 bottom-1 rounded-sm ${
                        STATUS_COLORS[appt.status] ?? "bg-slate-400"
                      } opacity-85 hover:opacity-100 transition-opacity cursor-default`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 0.5)}%`,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium">{appt.clientName}</p>
                      <p>{appt.service}</p>
                      <p className="font-english">
                        {appt.time} ({appt.duration}{t("min")})
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
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
                <span className="truncate text-muted-foreground">{appt.service}</span>
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
    </TooltipProvider>
  );
}
