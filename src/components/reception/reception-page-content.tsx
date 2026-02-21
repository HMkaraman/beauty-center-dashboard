"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, LayoutGrid, CalendarDays, CalendarRange, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceptionHeader } from "./reception-header";
import { AppointmentBoard } from "./appointment-board";
import { BookingOverlay } from "./booking-overlay";
import { QuickCheckout } from "./quick-checkout";
import { AvailabilityChecker } from "./availability-checker";
import { TodayAvailability } from "./today-availability";
import { DayScheduleView } from "./day-schedule-view";
import { WeekScheduleView } from "./week-schedule-view";
import { MonthScheduleView } from "./month-schedule-view";
import { useTodayAppointments, useAppointmentsByRange, useInvalidateReception } from "@/lib/hooks/use-reception";
import { useUpdateAppointment } from "@/lib/hooks/use-appointments";
import { Appointment } from "@/types";

type ViewMode = "day" | "week" | "month" | "board";

function formatDateForApi(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekStart(d: Date): Date {
  const day = d.getDay();
  // Start on Saturday (6)
  const diff = (day + 1) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  return start;
}

function getWeekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function getMonthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getMonthEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function ReceptionPageContent() {
  const t = useTranslations("reception");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: todayData, isLoading } = useTodayAppointments();
  const appointments = todayData?.data ?? [];
  const updateAppointment = useUpdateAppointment();
  const invalidateReception = useInvalidateReception();

  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [preselectedProvider, setPreselectedProvider] = useState<{ id: string; type: "employee" | "doctor" } | null>(null);
  const [bookingPreselect, setBookingPreselect] = useState<{
    providerId: string;
    providerType: "employee" | "doctor";
    providerName: string;
    time: string;
  } | null>(null);
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Compute date range for week/month views
  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      const start = getWeekStart(selectedDate);
      const end = getWeekEnd(start);
      return { dateFrom: formatDateForApi(start), dateTo: formatDateForApi(end) };
    }
    if (viewMode === "month") {
      const start = getMonthStart(selectedDate);
      const end = getMonthEnd(selectedDate);
      return { dateFrom: formatDateForApi(start), dateTo: formatDateForApi(end) };
    }
    return null;
  }, [viewMode, selectedDate]);

  const { data: rangeData } = useAppointmentsByRange(
    dateRange ?? { dateFrom: "", dateTo: "" },
    { enabled: !!dateRange }
  );
  const rangeAppointments = rangeData?.data ?? [];

  const handleAction = useCallback((id: string, action: string) => {
    const appointment = appointments.find((a) => a.id === id) ?? rangeAppointments.find((a) => a.id === id);
    if (!appointment) return;

    // Edit invoice — open checkout sheet without changing status
    if (action === "editInvoice") {
      setCheckoutAppointment(appointment);
      setCheckoutOpen(true);
      return;
    }

    // Edit appointment — navigate to appointment detail page
    if (action === "editAppointment") {
      router.push(`/appointments/${id}`);
      return;
    }

    const newStatus = action as Appointment["status"];
    const today = new Date().toISOString().split("T")[0];
    const queryKey = ["reception", "today-appointments", today];

    // Optimistic update: move the card instantly
    const previousData = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old: { data: Appointment[]; total: number; page: number; limit: number } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a
        ),
      };
    });

    // If completing, handle checkout immediately (don't wait for API)
    if (action === "completed") {
      if (appointment.groupId) {
        const groupAppts = appointments.filter(
          (a) => a.groupId === appointment.groupId && a.id !== id
        );
        const allOthersCompleted = groupAppts.every(
          (a) => a.status === "completed"
        );
        if (allOthersCompleted) {
          setCheckoutAppointment({ ...appointment, status: "completed" });
          setCheckoutOpen(true);
        } else {
          toast.info(t("groupNotComplete"));
        }
      } else {
        setCheckoutAppointment({ ...appointment, status: "completed" });
        setCheckoutOpen(true);
      }
    }

    // Fire API call in the background
    updateAppointment.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          invalidateReception();
        },
        onError: () => {
          // Rollback on failure
          queryClient.setQueryData(queryKey, previousData);
          toast.error(t("statusUpdateFailed"));
        },
      }
    );
  }, [appointments, rangeAppointments, updateAppointment, invalidateReception, queryClient, t, router]);

  const handleBookSlot = useCallback(
    (providerId: string, providerType: "employee" | "doctor", providerName: string, time: string) => {
      setBookingPreselect({ providerId, providerType, providerName, time });
      setBookingOpen(true);
    },
    []
  );

  const handleMoveAppointment = useCallback(
    (id: string, newTime: string) => {
      const today = new Date().toISOString().split("T")[0];
      const queryKey = ["reception", "today-appointments", today];

      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: { data: typeof appointments; total: number; page: number; limit: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.id === id ? { ...a, time: newTime } : a
          ),
        };
      });

      updateAppointment.mutate(
        { id, data: { time: newTime } },
        {
          onSuccess: () => {
            invalidateReception();
          },
          onError: () => {
            queryClient.setQueryData(queryKey, previousData);
            toast.error(t("statusUpdateFailed"));
          },
        }
      );
    },
    [updateAppointment, invalidateReception, queryClient, t, appointments]
  );

  const handleResizeAppointment = useCallback(
    (id: string, newDuration: number) => {
      if (newDuration < 15) {
        toast.error(t("durationTooShort"));
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const queryKey = ["reception", "today-appointments", today];

      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: { data: typeof appointments; total: number; page: number; limit: number } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((a) =>
            a.id === id ? { ...a, duration: newDuration } : a
          ),
        };
      });

      updateAppointment.mutate(
        { id, data: { duration: newDuration } },
        {
          onSuccess: () => {
            invalidateReception();
          },
          onError: () => {
            queryClient.setQueryData(queryKey, previousData);
            toast.error(t("statusUpdateFailed"));
          },
        }
      );
    },
    [updateAppointment, invalidateReception, queryClient, t, appointments]
  );

  const handleNavigate = useCallback((direction: -1 | 1) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "day") next.setDate(prev.getDate() + direction);
      else if (viewMode === "week") next.setDate(prev.getDate() + direction * 7);
      else if (viewMode === "month") next.setMonth(prev.getMonth() + direction);
      return next;
    });
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode("day");
  }, []);

  const dateLabel = useMemo(() => {
    if (viewMode === "day") {
      return selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (viewMode === "week") {
      const start = getWeekStart(selectedDate);
      const end = getWeekEnd(start);
      const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${startStr} – ${endStr}`;
    }
    if (viewMode === "month") {
      return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return "";
  }, [viewMode, selectedDate]);

  const isScheduleView = viewMode !== "board";

  return (
    <div className="flex flex-col h-screen">
      <ReceptionHeader />

      {/* Quick actions bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Date navigation — only for day/week/month */}
          {viewMode !== "board" && (
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleNavigate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={handleToday}>
                {t("todayButton")}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleNavigate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium font-english whitespace-nowrap">{dateLabel}</span>
            </div>
          )}
          {viewMode === "board" && (
            <h1 className="text-lg font-bold text-foreground">{t("todayBoard")}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle — hidden on mobile */}
          <div className="hidden sm:flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
            {([
              { mode: "day" as const, icon: CalendarDays, label: t("dayView") },
              { mode: "week" as const, icon: CalendarRange, label: t("weekView") },
              { mode: "month" as const, icon: Calendar, label: t("monthView") },
              { mode: "board" as const, icon: LayoutGrid, label: t("boardView") },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <Button onClick={() => { setBookingPreselect(null); setBookingOpen(true); }}>
            <Plus className="h-4 w-4" />
            {t("newBooking")}
          </Button>
        </div>
      </div>

      {/* Day schedule view (desktop only) */}
      {viewMode === "day" && (
        <DayScheduleView
          appointments={appointments}
          onAction={handleAction}
          onBookSlot={handleBookSlot}
          onMoveAppointment={handleMoveAppointment}
          onResizeAppointment={handleResizeAppointment}
        />
      )}

      {/* Week schedule view (desktop only) */}
      {viewMode === "week" && (
        <WeekScheduleView
          appointments={rangeAppointments}
          selectedDate={selectedDate}
          onAction={handleAction}
          onBookSlot={(date, time) => {
            setBookingPreselect(null);
            setBookingOpen(true);
          }}
          onDayClick={handleDayClick}
        />
      )}

      {/* Month schedule view (desktop only) */}
      {viewMode === "month" && (
        <MonthScheduleView
          appointments={rangeAppointments}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
        />
      )}

      {/* Board view OR mobile fallback */}
      {(viewMode === "board" || isScheduleView) && (
        <div className={`flex-1 overflow-auto p-4 space-y-4 ${isScheduleView ? "sm:hidden" : ""}`}>
          {/* Today's Availability */}
          <TodayAvailability
            onViewDetails={(id, type) => {
              setPreselectedProvider({ id, type });
              setCheckerOpen(true);
            }}
          />

          {/* Board */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          ) : (
            <AppointmentBoard
              appointments={appointments}
              onAction={handleAction}
            />
          )}
        </div>
      )}

      {/* Full-window Booking Overlay */}
      <BookingOverlay
        open={bookingOpen}
        onClose={() => { setBookingOpen(false); setBookingPreselect(null); }}
        preselectedProvider={bookingPreselect ? { id: bookingPreselect.providerId, type: bookingPreselect.providerType, name: bookingPreselect.providerName } : null}
        preselectedTime={bookingPreselect?.time ?? null}
      />

      {/* Availability Checker */}
      <AvailabilityChecker
        open={checkerOpen}
        onOpenChange={(open) => {
          setCheckerOpen(open);
          if (!open) setPreselectedProvider(null);
        }}
        preselectedProvider={preselectedProvider}
      />

      {/* Quick Checkout */}
      <QuickCheckout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        appointment={checkoutAppointment}
      />
    </div>
  );
}
