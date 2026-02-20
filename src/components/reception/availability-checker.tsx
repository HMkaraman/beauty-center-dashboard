"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Calendar, Clock, Zap } from "lucide-react";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useDoctors } from "@/lib/hooks/use-doctors";
import {
  useProviderSchedule,
  useTodayAvailability,
} from "@/lib/hooks/use-reception";
import { ScheduleTimeline, timeToMinutes } from "./schedule-timeline";
import {
  format,
  addDays,
  startOfWeek,
  isToday,
  isSameDay,
  type Locale,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface AvailabilityCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedProvider?: { id: string; type: "employee" | "doctor" } | null;
}

export function AvailabilityChecker({
  open,
  onOpenChange,
  preselectedProvider,
}: AvailabilityCheckerProps) {
  const t = useTranslations("reception");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  const [tab, setTab] = useState<"employees" | "doctors">("employees");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 6 })
  );

  useEffect(() => {
    if (open && preselectedProvider) {
      if (preselectedProvider.type === "employee") {
        setTab("employees");
        setSelectedEmployeeId(preselectedProvider.id);
        setSelectedDoctorId("");
      } else {
        setTab("doctors");
        setSelectedDoctorId(preselectedProvider.id);
        setSelectedEmployeeId("");
      }
    }
  }, [open, preselectedProvider]);

  const { data: employeesData } = useEmployees({ limit: 200 });
  const allEmployees = (employeesData?.data ?? []).filter(
    (e) => e.status === "active"
  );
  const { data: doctorsData } = useDoctors({ limit: 200 });
  const allDoctors = (doctorsData?.data ?? []).filter(
    (d) => d.status === "active"
  );

  const { data: todayAvailData } = useTodayAvailability();
  const todayProviders = todayAvailData?.providers ?? [];

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const scheduleParams =
    tab === "employees"
      ? { date: dateString, employeeId: selectedEmployeeId || undefined }
      : { date: dateString, doctorId: selectedDoctorId || undefined };

  const { data: scheduleData, isLoading } =
    useProviderSchedule(scheduleParams);

  const hasSelection =
    (tab === "employees" && !!selectedEmployeeId) ||
    (tab === "doctors" && !!selectedDoctorId);

  // Week days for date chip row
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Summary stats
  const summary = useMemo(() => {
    if (!scheduleData?.workingHours || scheduleData.notWorking) return null;
    const appts = scheduleData.appointments;
    const wh = scheduleData.workingHours;
    const totalWorkMin =
      timeToMinutes(wh.end) - timeToMinutes(wh.start);
    const busyMin = appts.reduce((sum, a) => sum + a.duration, 0);
    const freeMin = Math.max(0, totalWorkMin - busyMin);

    // Find next free slot
    let nextFreeTime: string | null = null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const sortedAppts = [...appts].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    const whStart = timeToMinutes(wh.start);
    const whEnd = timeToMinutes(wh.end);

    let cursor = whStart;
    for (const appt of sortedAppts) {
      const apptStart = timeToMinutes(appt.time);
      if (apptStart > cursor && apptStart - cursor >= 15) {
        // There's a gap
        const gapStart = cursor;
        if (!isToday(selectedDate) || gapStart >= nowMin) {
          const h = Math.floor(gapStart / 60);
          const m = gapStart % 60;
          nextFreeTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          break;
        }
      }
      cursor = Math.max(cursor, timeToMinutes(appt.time) + appt.duration);
    }
    if (!nextFreeTime && cursor < whEnd) {
      const gapStart = Math.max(cursor, isToday(selectedDate) ? nowMin : whStart);
      if (gapStart < whEnd) {
        const h = Math.floor(gapStart / 60);
        const m = gapStart % 60;
        nextFreeTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }

    return {
      appointmentCount: appts.length,
      freeMin,
      nextFreeTime,
    };
  }, [scheduleData, selectedDate]);

  // Helper to get today's info for a provider
  function getProviderInfo(
    id: string,
    type: "employee" | "doctor"
  ): { status: "free" | "busy" | "off" | null; image: string | null } {
    const p = todayProviders.find((p) => p.id === id && p.type === type);
    return { status: p?.currentStatus ?? null, image: p?.image ?? null };
  }

  const statusDotColor: Record<string, string> = {
    free: "bg-green-500",
    busy: "bg-amber-500",
    off: "bg-muted-foreground/40",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-lg">
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

            <TabsContent value="employees" className="mt-3">
              <ProviderChipRow
                providers={allEmployees.map((e) => {
                  const info = getProviderInfo(e.id, "employee");
                  return {
                    id: e.id,
                    name: e.name,
                    image: info.image,
                    status: info.status,
                  };
                })}
                selectedId={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
                statusDotColor={statusDotColor}
              />
            </TabsContent>

            <TabsContent value="doctors" className="mt-3">
              <ProviderChipRow
                providers={allDoctors.map((d) => {
                  const info = getProviderInfo(d.id, "doctor");
                  return {
                    id: d.id,
                    name: d.name,
                    image: info.image,
                    status: info.status,
                  };
                })}
                selectedId={selectedDoctorId}
                onSelect={setSelectedDoctorId}
                statusDotColor={statusDotColor}
              />
            </TabsContent>
          </Tabs>

          {/* Date navigation */}
          <DateChipRow
            weekDays={weekDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevWeek={() => setWeekStart((w) => addDays(w, -7))}
            onNextWeek={() => setWeekStart((w) => addDays(w, 7))}
            dateLocale={dateLocale}
            todayLabel={t("today")}
            prevLabel={t("prevWeek")}
            nextLabel={t("nextWeek")}
          />

          {/* Schedule display */}
          {hasSelection && (
            <div className="pt-2">
              {isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  ...
                </p>
              ) : scheduleData?.notWorking ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {t("notWorkingToday")}
                  </p>
                </div>
              ) : scheduleData?.workingHours ? (
                <div className="space-y-3">
                  {/* Summary stats */}
                  {summary && <ScheduleSummary summary={summary} t={t} />}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("schedule")}</span>
                    <span className="font-english">
                      {scheduleData.workingHours.start} -{" "}
                      {scheduleData.workingHours.end}
                    </span>
                  </div>
                  <ScheduleTimeline
                    workingHours={scheduleData.workingHours}
                    appointments={scheduleData.appointments}
                    showCurrentTime={isToday(selectedDate)}
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

// ─── Provider Chip Row ───────────────────────────────────────

interface ProviderChip {
  id: string;
  name: string;
  image: string | null;
  status: "free" | "busy" | "off" | null;
}

function ProviderChipRow({
  providers,
  selectedId,
  onSelect,
  statusDotColor,
}: {
  providers: ProviderChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  statusDotColor: Record<string, string>;
}) {
  if (providers.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {providers.map((p) => {
        const isSelected = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg shrink-0 transition-colors ${
              isSelected
                ? "bg-primary/10 ring-2 ring-primary"
                : "hover:bg-muted"
            }`}
          >
            <div className="relative">
              <Avatar size="sm">
                {p.image && <AvatarImage src={p.image} alt={p.name} />}
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {p.status && (
                <span
                  className={`absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                    statusDotColor[p.status] ?? ""
                  }`}
                />
              )}
            </div>
            <span className="text-[10px] leading-tight max-w-14 truncate text-center">
              {p.name.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Date Chip Row ───────────────────────────────────────────

function DateChipRow({
  weekDays,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  dateLocale,
  todayLabel,
  prevLabel,
  nextLabel,
}: {
  weekDays: Date[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  dateLocale: Locale;
  todayLabel: string;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onPrevWeek}
        aria-label={prevLabel}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </Button>

      <div className="flex gap-1 flex-1 justify-between overflow-hidden">
        {weekDays.map((day) => {
          const isSel = isSameDay(day, selectedDate);
          const isTod = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-xs transition-colors flex-1 min-w-0 ${
                isSel
                  ? "bg-primary text-primary-foreground"
                  : isTod
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
              }`}
            >
              <span className="text-[10px] leading-tight">
                {format(day, "EEE", { locale: dateLocale })}
              </span>
              <span className="font-english font-medium leading-tight">
                {format(day, "d")}
              </span>
              {isTod && !isSel && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onNextWeek}
        aria-label={nextLabel}
      >
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}

// ─── Schedule Summary ────────────────────────────────────────

function ScheduleSummary({
  summary,
  t,
}: {
  summary: {
    appointmentCount: number;
    freeMin: number;
    nextFreeTime: string | null;
  };
  t: ReturnType<typeof useTranslations<"reception">>;
}) {
  const freeHours = Math.floor(summary.freeMin / 60);
  const freeMins = summary.freeMin % 60;
  const freeLabel =
    freeHours > 0
      ? `${freeHours}${t("hours")} ${freeMins > 0 ? `${freeMins}${t("min")}` : ""}`
      : `${freeMins}${t("min")}`;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-lg border border-border p-2 text-center">
        <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
        <p className="text-sm font-semibold font-english">
          {summary.appointmentCount}
        </p>
        <p className="text-[10px] text-muted-foreground">{t("appointments")}</p>
      </div>
      <div className="rounded-lg border border-border p-2 text-center">
        <Clock className="h-3.5 w-3.5 mx-auto text-green-600 mb-1" />
        <p className="text-sm font-semibold font-english">{freeLabel}</p>
        <p className="text-[10px] text-muted-foreground">{t("freeTime")}</p>
      </div>
      <div className="rounded-lg border border-border p-2 text-center">
        <Zap className="h-3.5 w-3.5 mx-auto text-amber-500 mb-1" />
        <p className="text-sm font-semibold font-english">
          {summary.nextFreeTime ?? "—"}
        </p>
        <p className="text-[10px] text-muted-foreground">{t("nextFree")}</p>
      </div>
    </div>
  );
}
