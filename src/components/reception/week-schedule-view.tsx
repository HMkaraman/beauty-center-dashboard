"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Clock, FileEdit, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { STATUS_COLORS } from "./schedule-timeline";
import { statusActions } from "./board-card";
import type { Appointment } from "@/types";

const PX_PER_MINUTE = 2;
const TIME_GUTTER_WIDTH = 56;
const MIN_BLOCK_HEIGHT = 30;
const DAY_COLUMN_MIN_WIDTH = 140;

interface WeekScheduleViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAction: (id: string, action: string) => void;
  onBookSlot: (date: string, time: string) => void;
  onDayClick: (date: Date) => void;
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

function snapTo15(mins: number): number {
  return Math.floor(mins / 15) * 15;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekDays(selectedDate: Date): Date[] {
  // Week starts on Saturday
  const day = selectedDate.getDay();
  const diff = (day + 1) % 7;
  const start = new Date(selectedDate);
  start.setDate(selectedDate.getDate() - diff);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function WeekScheduleView({
  appointments,
  selectedDate,
  onAction,
  onBookSlot,
  onDayClick,
}: WeekScheduleViewProps) {
  const t = useTranslations("reception");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const today = useMemo(() => new Date(), []);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appt of appointments) {
      const key = appt.date;
      const arr = map.get(key) ?? [];
      arr.push(appt);
      map.set(key, arr);
    }
    return map;
  }, [appointments]);

  // Compute time range from appointments (or fallback 09:00–18:00)
  const { dayStartMin, dayEndMin, totalMinutes } = useMemo(() => {
    let earliest = 24 * 60;
    let latest = 0;
    for (const appt of appointments) {
      const s = timeToMinutes(appt.time);
      const e = s + appt.duration;
      if (s < earliest) earliest = s;
      if (e > latest) latest = e;
    }
    // Snap to hour boundaries with 1h padding
    earliest = Math.floor(earliest / 60) * 60;
    latest = Math.ceil(latest / 60) * 60;
    if (earliest >= latest) {
      earliest = 9 * 60;
      latest = 18 * 60;
    }
    // Add padding
    earliest = Math.max(0, earliest - 60);
    latest = Math.min(24 * 60, latest + 60);
    return { dayStartMin: earliest, dayEndMin: latest, totalMinutes: latest - earliest };
  }, [appointments]);

  const totalHeight = totalMinutes * PX_PER_MINUTE;

  // Hour labels
  const hourLabels = useMemo(() => {
    const labels: { time: string; offset: number }[] = [];
    const startHour = dayStartMin / 60;
    const endHour = dayEndMin / 60;
    for (let h = startHour; h <= endHour; h++) {
      labels.push({
        time: minutesToTime(h * 60),
        offset: (h * 60 - dayStartMin) * PX_PER_MINUTE,
      });
    }
    return labels;
  }, [dayStartMin, dayEndMin]);

  // Grid lines
  const gridLines = useMemo(() => {
    const lines: { offset: number; isHour: boolean }[] = [];
    const startHalf = Math.ceil(dayStartMin / 30);
    const endHalf = Math.floor(dayEndMin / 30);
    for (let half = startHalf; half <= endHalf; half++) {
      const mins = half * 30;
      lines.push({
        offset: (mins - dayStartMin) * PX_PER_MINUTE,
        isHour: mins % 60 === 0,
      });
    }
    return lines;
  }, [dayStartMin, dayEndMin]);

  // Current time tracking
  const [nowMinutes, setNowMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const showNowLine = nowMinutes >= dayStartMin && nowMinutes <= dayEndMin;
  const nowOffset = showNowLine ? (nowMinutes - dayStartMin) * PX_PER_MINUTE : 0;

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (!hasScrolled.current && scrollRef.current && showNowLine) {
      const containerHeight = scrollRef.current.clientHeight;
      const scrollTarget = Math.max(0, nowOffset - containerHeight / 3);
      scrollRef.current.scrollTop = scrollTarget;
      hasScrolled.current = true;
    }
  }, [showNowLine, nowOffset]);

  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>, dayDate: Date) => {
    if ((e.target as HTMLElement).closest("[data-appointment]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickedMinute = dayStartMin + clickY / PX_PER_MINUTE;
    const snappedMinute = snapTo15(clickedMinute);
    const snappedTime = minutesToTime(Math.max(dayStartMin, Math.min(dayEndMin, snappedMinute)));
    onBookSlot(formatDateKey(dayDate), snappedTime);
  };

  const dayNameFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const dayNumFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric" });

  return (
    <div className="hidden sm:flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        <div className="inline-flex min-w-full">
          {/* Sticky corner */}
          <div
            className="sticky top-0 start-0 z-30 bg-background border-b border-e border-border shrink-0"
            style={{ width: TIME_GUTTER_WIDTH }}
          />

          {/* Day column headers */}
          <div className="sticky top-0 z-20 flex bg-background border-b border-border flex-1">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={formatDateKey(day)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 border-e border-border cursor-pointer hover:bg-accent/20 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                  style={{ minWidth: DAY_COLUMN_MIN_WIDTH }}
                  onClick={() => onDayClick(day)}
                >
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {dayNameFormatter.format(day)}
                  </span>
                  <span
                    className={`text-sm font-english font-bold ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {dayNumFormatter.format(day)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline body */}
        <div className="inline-flex min-w-full" style={{ height: totalHeight }}>
          {/* Time gutter */}
          <div
            className="sticky start-0 z-10 bg-background border-e border-border shrink-0 relative"
            style={{ width: TIME_GUTTER_WIDTH, height: totalHeight }}
          >
            {hourLabels.map((label) => (
              <div
                key={label.time}
                className="absolute end-2 -translate-y-1/2 text-[11px] font-english text-muted-foreground tabular-nums"
                style={{ top: label.offset }}
              >
                {label.time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex relative flex-1" style={{ height: totalHeight }}>
            {/* Grid lines */}
            {gridLines.map((line, i) => (
              <div
                key={i}
                className={`absolute start-0 end-0 ${
                  line.isHour ? "border-t border-border" : "border-t border-border/40 border-dashed"
                }`}
                style={{ top: line.offset }}
              />
            ))}

            {/* Day columns */}
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day);
              const dayAppts = appointmentsByDate.get(dateKey) ?? [];
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={dateKey}
                  className={`flex-1 relative border-e border-border cursor-pointer hover:bg-accent/10 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                  style={{ minWidth: DAY_COLUMN_MIN_WIDTH, height: totalHeight }}
                  onClick={(e) => handleColumnClick(e, day)}
                >
                  {/* Current time line (only for today) */}
                  {isToday && showNowLine && (
                    <div
                      className="absolute start-0 end-0 z-10 flex items-center pointer-events-none"
                      style={{ top: nowOffset }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ms-1 shrink-0" />
                      <div className="flex-1 h-0.5 bg-red-500" />
                    </div>
                  )}

                  {/* Appointment blocks */}
                  {dayAppts.map((appt) => (
                    <WeekAppointmentBlock
                      key={appt.id}
                      appointment={appt}
                      dayStartMin={dayStartMin}
                      onAction={onAction}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface WeekAppointmentBlockProps {
  appointment: Appointment;
  dayStartMin: number;
  onAction: (id: string, action: string) => void;
}

function WeekAppointmentBlock({ appointment, dayStartMin, onAction }: WeekAppointmentBlockProps) {
  const t = useTranslations("reception");
  const apptStartMin = timeToMinutes(appointment.time);
  const topOffset = (apptStartMin - dayStartMin) * PX_PER_MINUTE;
  const rawHeight = appointment.duration * PX_PER_MINUTE;
  const blockHeight = Math.max(rawHeight, MIN_BLOCK_HEIGHT);
  const isCompleted = appointment.status === "completed";

  const bgColor = STATUS_COLORS[appointment.status] ?? "bg-slate-400";
  const actionInfo = statusActions[appointment.status];

  const showClient = blockHeight >= 30;
  const showService = blockHeight >= 50;
  const showTime = blockHeight >= 70;

  // Show provider name (employee or doctor)
  const providerName = appointment.employee || appointment.doctor || "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-appointment
          className={`absolute inset-x-1 rounded-md px-1.5 py-1 text-start text-white overflow-hidden transition-opacity
            ${bgColor} ${isCompleted ? "opacity-50" : "opacity-90 hover:opacity-100"}
            cursor-pointer shadow-sm`}
          style={{ top: topOffset, height: blockHeight }}
        >
          {providerName && (
            <p className="text-[10px] font-medium truncate leading-tight opacity-80">
              {providerName}
            </p>
          )}
          {showClient && (
            <p className="text-[11px] font-medium truncate leading-tight">
              {appointment.clientName}
            </p>
          )}
          {showService && (
            <p className="text-[10px] truncate leading-tight opacity-90">
              {appointment.service}
            </p>
          )}
          {showTime && (
            <p className="text-[10px] font-english truncate leading-tight opacity-80">
              {appointment.time} · {appointment.duration}{t("min")}
            </p>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-56 p-3 space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">{appointment.clientName}</p>
          <p className="text-xs text-muted-foreground">{appointment.service}</p>
          {providerName && (
            <p className="text-xs text-muted-foreground">{providerName}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-english">
            <Clock className="h-3 w-3" />
            {appointment.time} · {appointment.duration}{t("min")}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {actionInfo && (
            <Button
              size="sm"
              className={`w-full text-white text-xs h-7 ${actionInfo.color}`}
              onClick={() => onAction(appointment.id, actionInfo.action)}
            >
              {t(actionInfo.labelKey)}
            </Button>
          )}
          {isCompleted && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7"
              onClick={() => onAction(appointment.id, "editInvoice")}
            >
              <FileEdit className="h-3 w-3" />
              {t("editInvoice")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => onAction(appointment.id, "editAppointment")}
          >
            <Pencil className="h-3 w-3" />
            {t("editAppointment")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
