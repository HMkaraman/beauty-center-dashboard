"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { STATUS_COLORS } from "./schedule-timeline";
import type { Appointment } from "@/types";

interface MonthScheduleViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDayClick: (date: Date) => void;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const MAX_MINI_BLOCKS = 3;

export function MonthScheduleView({
  appointments,
  selectedDate,
  onDayClick,
}: MonthScheduleViewProps) {
  const t = useTranslations("reception");
  const today = useMemo(() => new Date(), []);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Build calendar grid — 6 rows x 7 columns starting from Saturday
  const calendarWeeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Saturday = 6, we want the grid to start on Saturday
    // dayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
    // satOffset: how many days before the 1st to go back to Saturday
    const satOffset = (firstDay.getDay() + 1) % 7;

    const weeks: Date[][] = [];
    let current = new Date(firstDay);
    current.setDate(current.getDate() - satOffset);

    // Generate 6 weeks
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    // Trim trailing weeks that are entirely outside the month
    while (
      weeks.length > 4 &&
      weeks[weeks.length - 1].every((d) => d.getMonth() !== month)
    ) {
      weeks.pop();
    }

    return { weeks, lastDay };
  }, [year, month]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const arr = map.get(appt.date) ?? [];
      arr.push(appt);
      map.set(appt.date, arr);
    }
    return map;
  }, [appointments]);

  const dayNames = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="hidden sm:flex flex-col flex-1 min-h-0 overflow-auto p-4">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-s border-border">
        {calendarWeeks.weeks.map((week) =>
          week.map((day) => {
            const dateKey = formatDateKey(day);
            const dayAppts = appointmentsByDate.get(dateKey) ?? [];
            const isCurrentMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dateKey}
                className={`border-e border-b border-border min-h-[100px] p-1.5 cursor-pointer hover:bg-accent/20 transition-colors ${
                  !isCurrentMonth ? "opacity-40 bg-muted/20" : ""
                } ${isToday ? "bg-primary/5" : ""}`}
                onClick={() => onDayClick(day)}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-english font-medium ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        : "text-foreground"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-english">
                      {dayAppts.length}
                    </span>
                  )}
                </div>

                {/* Mini appointment blocks */}
                <div className="space-y-0.5">
                  {dayAppts.slice(0, MAX_MINI_BLOCKS).map((appt) => {
                    const bgColor = STATUS_COLORS[appt.status] ?? "bg-slate-400";
                    return (
                      <div
                        key={appt.id}
                        className={`${bgColor} rounded-sm px-1 py-0.5 text-white truncate text-[10px] leading-tight`}
                      >
                        <span className="font-english">{appt.time}</span>{" "}
                        {appt.clientName}
                      </div>
                    );
                  })}
                  {dayAppts.length > MAX_MINI_BLOCKS && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayAppts.length - MAX_MINI_BLOCKS}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
