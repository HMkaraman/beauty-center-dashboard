"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { User, Clock, FileEdit, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useTodayAvailability,
  type TodayAvailabilityProvider,
} from "@/lib/hooks/use-reception";
import { STATUS_COLORS } from "./schedule-timeline";
import { statusActions } from "./board-card";

const PX_PER_MINUTE = 2;
const TIME_GUTTER_WIDTH = 56; // w-14 = 56px
const MIN_BLOCK_HEIGHT = 30;
const COLUMN_MIN_WIDTH = 160;
const DRAG_THRESHOLD = 5; // px before drag activates

interface DayScheduleViewProps {
  appointments: Array<{
    id: string;
    time: string;
    duration: number;
    clientName: string;
    service: string;
    status: string;
    employeeId?: string | null;
    doctorId?: string | null;
  }>;
  onAction: (id: string, action: string) => void;
  onBookSlot: (providerId: string, providerType: "employee" | "doctor", providerName: string, time: string) => void;
  onMoveAppointment?: (id: string, newTime: string) => void;
  onResizeAppointment?: (id: string, newDuration: number) => void;
}

type DragState = {
  type: "move";
  appointmentId: string;
  startY: number;
  originalMin: number;
  currentMin: number;
  duration: number;
  hasConflict: boolean;
} | {
  type: "resize";
  appointmentId: string;
  startY: number;
  originalDuration: number;
  currentDuration: number;
  startMin: number;
  hasConflict: boolean;
} | null;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Snap minutes down to nearest 30-min interval (matches visual grid) */
function snapTo30(mins: number): number {
  return Math.floor(mins / 30) * 30;
}

/** Snap minutes to nearest 15-min interval (for resize fine control) */
function snapTo15(mins: number): number {
  return Math.round(mins / 15) * 15;
}

/** Sort providers: employees first, then doctors. Working first within each group. Alphabetical within. */
function sortProviders(providers: TodayAvailabilityProvider[]): TodayAvailabilityProvider[] {
  return [...providers].sort((a, b) => {
    // employees before doctors
    if (a.type !== b.type) return a.type === "employee" ? -1 : 1;
    // working before off
    if (a.notWorking !== b.notWorking) return a.notWorking ? 1 : -1;
    // alphabetical
    return a.name.localeCompare(b.name);
  });
}

/** Check if two time ranges overlap */
function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

export function DayScheduleView({ appointments, onAction, onBookSlot, onMoveAppointment, onResizeAppointment }: DayScheduleViewProps) {
  const t = useTranslations("reception");
  const { data } = useTodayAvailability();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Drag state
  const [dragState, setDragState] = useState<DragState>(null);
  const dragStartRef = useRef<{ y: number; moved: boolean } | null>(null);
  // Track which provider column the drag is happening in
  const dragProviderKeyRef = useRef<string | null>(null);

  const providers = useMemo(
    () => sortProviders(data?.providers ?? []),
    [data?.providers]
  );

  // Compute day range from all providers' working hours
  const { dayStartMin, dayEndMin, totalMinutes } = useMemo(() => {
    let earliest = 24 * 60;
    let latest = 0;
    for (const p of providers) {
      if (p.workingHours) {
        const s = timeToMinutes(p.workingHours.start);
        const e = timeToMinutes(p.workingHours.end);
        if (s < earliest) earliest = s;
        if (e > latest) latest = e;
      }
    }
    // Snap to hour boundaries
    earliest = Math.floor(earliest / 60) * 60;
    latest = Math.ceil(latest / 60) * 60;
    // Fallback if no providers
    if (earliest >= latest) {
      earliest = 9 * 60;
      latest = 18 * 60;
    }
    return { dayStartMin: earliest, dayEndMin: latest, totalMinutes: latest - earliest };
  }, [providers]);

  const totalHeight = totalMinutes * PX_PER_MINUTE;

  // Generate hour labels
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

  // Half-hour grid lines
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

  // Map appointments to providers
  const appointmentsByProvider = useMemo(() => {
    const map = new Map<string, typeof appointments>();
    for (const p of providers) {
      // Use the provider's own appointments from today-availability endpoint
      // which are already filtered per-provider
      const providerAppts = p.appointments.map((pa) => {
        // Find the full appointment data from the appointments list
        const full = appointments.find((a) => a.id === pa.id);
        return {
          id: pa.id,
          time: pa.time,
          duration: pa.duration,
          clientName: pa.clientName,
          service: pa.service,
          status: full?.status ?? pa.status, // prefer latest status from optimistic updates
        };
      });
      map.set(`${p.type}-${p.id}`, providerAppts);
    }
    return map;
  }, [providers, appointments]);

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

  // Check for conflicts in a provider column
  const checkConflict = useCallback(
    (providerKey: string, appointmentId: string, startMin: number, duration: number): { hasConflict: boolean; conflictClient?: string } => {
      const providerAppts = appointmentsByProvider.get(providerKey) ?? [];
      const endMin = startMin + duration;
      for (const appt of providerAppts) {
        if (appt.id === appointmentId) continue;
        const apptStart = timeToMinutes(appt.time);
        const apptEnd = apptStart + appt.duration;
        if (rangesOverlap(startMin, endMin, apptStart, apptEnd)) {
          return { hasConflict: true, conflictClient: appt.clientName };
        }
      }
      return { hasConflict: false };
    },
    [appointmentsByProvider]
  );

  // Handle pointer move for drag/resize (on document level)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;

      const deltaY = e.clientY - dragStartRef.current.y;
      if (!dragStartRef.current.moved && Math.abs(deltaY) < DRAG_THRESHOLD) return;
      dragStartRef.current.moved = true;

      const providerKey = dragProviderKeyRef.current;
      if (!providerKey) return;

      if (dragState.type === "move") {
        const deltaMinutes = deltaY / PX_PER_MINUTE;
        const rawMin = dragState.originalMin + deltaMinutes;
        const snappedMin = snapTo30(rawMin);
        const clampedMin = Math.max(dayStartMin, Math.min(dayEndMin - dragState.duration, snappedMin));

        const { hasConflict } = checkConflict(providerKey, dragState.appointmentId, clampedMin, dragState.duration);

        setDragState((prev) => prev?.type === "move" ? {
          ...prev,
          currentMin: clampedMin,
          hasConflict,
        } : prev);
      } else if (dragState.type === "resize") {
        const deltaMinutes = deltaY / PX_PER_MINUTE;
        const rawDuration = dragState.originalDuration + deltaMinutes;
        const snappedDuration = snapTo15(rawDuration);
        const clampedDuration = Math.max(15, snappedDuration);

        const { hasConflict } = checkConflict(providerKey, dragState.appointmentId, dragState.startMin, clampedDuration);

        setDragState((prev) => prev?.type === "resize" ? {
          ...prev,
          currentDuration: clampedDuration,
          hasConflict,
        } : prev);
      }
    };

    const handlePointerUp = () => {
      if (!dragStartRef.current?.moved) {
        // No real drag happened — let the click/popover work
        setDragState(null);
        dragStartRef.current = null;
        dragProviderKeyRef.current = null;
        return;
      }

      if (dragState.type === "move") {
        if (!dragState.hasConflict && dragState.currentMin !== dragState.originalMin) {
          onMoveAppointment?.(dragState.appointmentId, minutesToTime(dragState.currentMin));
        }
        // If conflict, it just snaps back (state resets)
      } else if (dragState.type === "resize") {
        if (!dragState.hasConflict && dragState.currentDuration !== dragState.originalDuration) {
          onResizeAppointment?.(dragState.appointmentId, dragState.currentDuration);
        }
      }

      setDragState(null);
      dragStartRef.current = null;
      dragProviderKeyRef.current = null;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, dayStartMin, dayEndMin, checkConflict, onMoveAppointment, onResizeAppointment]);

  // Start move drag
  const handleMoveStart = useCallback(
    (e: React.PointerEvent, appointmentId: string, providerKey: string, startMin: number, duration: number) => {
      // Prevent text selection
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      dragStartRef.current = { y: e.clientY, moved: false };
      dragProviderKeyRef.current = providerKey;

      setDragState({
        type: "move",
        appointmentId,
        startY: e.clientY,
        originalMin: startMin,
        currentMin: startMin,
        duration,
        hasConflict: false,
      });
    },
    []
  );

  // Start resize drag
  const handleResizeStart = useCallback(
    (e: React.PointerEvent, appointmentId: string, providerKey: string, startMin: number, duration: number) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      dragStartRef.current = { y: e.clientY, moved: false };
      dragProviderKeyRef.current = providerKey;

      setDragState({
        type: "resize",
        appointmentId,
        startY: e.clientY,
        originalDuration: duration,
        currentDuration: duration,
        startMin,
        hasConflict: false,
      });
    },
    []
  );

  // Handle click on empty column space to book a slot
  const handleColumnClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, provider: TodayAvailabilityProvider) => {
      if (provider.notWorking) return;
      // Don't fire during drag
      if (dragStartRef.current?.moved) return;
      // Only fire if clicking the column background, not an appointment block
      if ((e.target as HTMLElement).closest("[data-appointment]")) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickedMinute = dayStartMin + clickY / PX_PER_MINUTE;
      const snappedMinute = snapTo30(clickedMinute);
      const snappedTime = minutesToTime(Math.max(dayStartMin, Math.min(dayEndMin, snappedMinute)));
      onBookSlot(provider.id, provider.type, provider.name, snappedTime);
    },
    [dayStartMin, dayEndMin, onBookSlot]
  );

  if (providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex flex-col flex-1 min-h-0">
      {/* Scrollable container */}
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        <div className="inline-flex min-w-full">
          {/* Sticky corner cell (above time gutter + left of provider headers) */}
          <div
            className="sticky top-0 start-0 z-30 bg-background border-b border-e border-border shrink-0"
            style={{ width: TIME_GUTTER_WIDTH }}
          />

          {/* Provider column headers — sticky top */}
          <div className="sticky top-0 z-20 flex bg-background border-b border-border">
            {providers.map((provider) => (
              <div
                key={`${provider.type}-${provider.id}`}
                className={`flex flex-col items-center gap-1 py-2 px-2 border-e border-border ${
                  provider.notWorking ? "opacity-40" : ""
                }`}
                style={{ minWidth: COLUMN_MIN_WIDTH, width: COLUMN_MIN_WIDTH }}
              >
                <Avatar size="sm">
                  {provider.image ? (
                    <AvatarImage src={provider.image} alt={provider.name} />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-full">
                  {provider.name}
                </span>
                <StatusDot status={provider.currentStatus} label={
                  provider.currentStatus === "free" ? t("free") :
                  provider.currentStatus === "busy" ? t("busy") : t("off")
                } />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline body */}
        <div className="inline-flex min-w-full" style={{ height: totalHeight }}>
          {/* Time gutter — sticky start */}
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

          {/* Provider columns */}
          <div className="flex relative" style={{ height: totalHeight }}>
            {/* Grid lines spanning all columns */}
            {gridLines.map((line, i) => (
              <div
                key={i}
                className={`absolute start-0 end-0 ${
                  line.isHour ? "border-t border-border" : "border-t border-border/40 border-dashed"
                }`}
                style={{ top: line.offset }}
              />
            ))}

            {/* Current time indicator */}
            {showNowLine && (
              <div
                className="absolute start-0 end-0 z-10 flex items-center pointer-events-none"
                style={{ top: nowOffset }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ms-1 shrink-0" />
                <div className="flex-1 h-0.5 bg-red-500" />
              </div>
            )}

            {/* Individual provider columns */}
            {providers.map((provider) => {
              const key = `${provider.type}-${provider.id}`;
              const providerAppts = appointmentsByProvider.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={`relative border-e border-border ${
                    provider.notWorking
                      ? "bg-muted/30 cursor-not-allowed"
                      : "cursor-pointer hover:bg-accent/20"
                  }`}
                  style={{ minWidth: COLUMN_MIN_WIDTH, width: COLUMN_MIN_WIDTH, height: totalHeight }}
                  onClick={(e) => handleColumnClick(e, provider)}
                >
                  {/* Off-hours shading (before working hours) */}
                  {provider.workingHours && !provider.notWorking && (
                    <>
                      {timeToMinutes(provider.workingHours.start) > dayStartMin && (
                        <div
                          className="absolute inset-x-0 top-0 bg-muted/30"
                          style={{
                            height: (timeToMinutes(provider.workingHours.start) - dayStartMin) * PX_PER_MINUTE,
                          }}
                        />
                      )}
                      {timeToMinutes(provider.workingHours.end) < dayEndMin && (
                        <div
                          className="absolute inset-x-0 bottom-0 bg-muted/30"
                          style={{
                            height: (dayEndMin - timeToMinutes(provider.workingHours.end)) * PX_PER_MINUTE,
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Appointment blocks */}
                  {providerAppts.map((appt) => (
                    <AppointmentBlock
                      key={appt.id}
                      appointment={appt}
                      dayStartMin={dayStartMin}
                      onAction={onAction}
                      providerKey={key}
                      dragState={dragState}
                      onMoveStart={handleMoveStart}
                      onResizeStart={handleResizeStart}
                      isDraggable={!!onMoveAppointment}
                      isResizable={!!onResizeAppointment}
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

// --- Sub-components ---

function StatusDot({ status, label }: { status: "free" | "busy" | "off"; label: string }) {
  const colors = {
    free: "bg-green-500",
    busy: "bg-blue-500",
    off: "bg-muted-foreground",
  };
  return (
    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status]}`} />
      {label}
    </span>
  );
}

interface AppointmentBlockProps {
  appointment: {
    id: string;
    time: string;
    duration: number;
    clientName: string;
    service: string;
    status: string;
  };
  dayStartMin: number;
  onAction: (id: string, action: string) => void;
  providerKey: string;
  dragState: DragState;
  onMoveStart: (e: React.PointerEvent, id: string, providerKey: string, startMin: number, duration: number) => void;
  onResizeStart: (e: React.PointerEvent, id: string, providerKey: string, startMin: number, duration: number) => void;
  isDraggable: boolean;
  isResizable: boolean;
}

function AppointmentBlock({
  appointment,
  dayStartMin,
  onAction,
  providerKey,
  dragState,
  onMoveStart,
  onResizeStart,
  isDraggable,
  isResizable,
}: AppointmentBlockProps) {
  const t = useTranslations("reception");
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";
  const canDrag = isDraggable && !isCompleted && !isCancelled;
  const canResize = isResizable && !isCompleted && !isCancelled;

  // Check if this block is being dragged/resized
  const isDragging = dragState?.appointmentId === appointment.id && dragState.type === "move";
  const isResizing = dragState?.appointmentId === appointment.id && dragState.type === "resize";

  // Calculate position & size (use drag state if active)
  const apptStartMin = isDragging ? dragState.currentMin : timeToMinutes(appointment.time);
  const duration = isResizing ? dragState.currentDuration : appointment.duration;
  const topOffset = (apptStartMin - dayStartMin) * PX_PER_MINUTE;
  const rawHeight = duration * PX_PER_MINUTE;
  const blockHeight = Math.max(rawHeight, MIN_BLOCK_HEIGHT);

  const bgColor = STATUS_COLORS[appointment.status] ?? "bg-slate-400";
  const actionInfo = statusActions[appointment.status];

  // Conflict ring
  const hasConflict = (isDragging || isResizing) && dragState?.hasConflict;

  // Decide what text to show based on block height
  const showService = blockHeight >= 50;
  const showTime = blockHeight >= 70;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canDrag) return;
      // Only primary button
      if (e.button !== 0) return;
      onMoveStart(e, appointment.id, providerKey, timeToMinutes(appointment.time), appointment.duration);
    },
    [canDrag, onMoveStart, appointment.id, providerKey, appointment.time, appointment.duration]
  );

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canResize) return;
      if (e.button !== 0) return;
      onResizeStart(e, appointment.id, providerKey, timeToMinutes(appointment.time), appointment.duration);
    },
    [canResize, onResizeStart, appointment.id, providerKey, appointment.time, appointment.duration]
  );

  // During active drag, render without the Popover wrapper to avoid triggering it
  const isActive = isDragging || isResizing;

  const blockContent = (
    <>
      <p className="text-[11px] font-medium truncate leading-tight">
        {appointment.clientName}
      </p>
      {showService && (
        <p className="text-[10px] truncate leading-tight opacity-90">
          {appointment.service}
        </p>
      )}
      {showTime && (
        <p className="text-[10px] font-english truncate leading-tight opacity-80">
          {isDragging ? minutesToTime(dragState.currentMin) : appointment.time} · {duration}{t("min")}
        </p>
      )}
      {/* Resize handle */}
      {canResize && (
        <div
          className="absolute bottom-0 inset-x-0 h-1.5 cursor-s-resize hover:bg-white/30 rounded-b-md"
          onPointerDown={handleResizePointerDown}
        />
      )}
    </>
  );

  const blockClasses = `absolute inset-x-1 rounded-md px-1.5 py-1 text-start text-white overflow-hidden
    ${bgColor}
    ${isCompleted ? "opacity-50" : isActive ? "opacity-70 shadow-lg z-20" : "opacity-90 hover:opacity-100"}
    ${hasConflict ? "ring-2 ring-red-500" : isActive ? "ring-2 ring-primary" : ""}
    ${canDrag ? "touch-none" : ""}
    cursor-pointer shadow-sm`;

  if (isActive) {
    // During drag, render a plain div (no popover)
    return (
      <div
        data-appointment
        className={blockClasses}
        style={{ top: topOffset, height: blockHeight }}
      >
        {blockContent}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-appointment
          className={blockClasses}
          style={{ top: topOffset, height: blockHeight }}
          onPointerDown={handlePointerDown}
        >
          {blockContent}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-56 p-3 space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">{appointment.clientName}</p>
          <p className="text-xs text-muted-foreground">{appointment.service}</p>
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
