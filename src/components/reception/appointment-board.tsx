"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BoardCard } from "./board-card";
import { Appointment } from "@/types";

interface AppointmentBoardProps {
  appointments: Appointment[];
  onAction: (id: string, action: string) => void;
}

interface Column {
  key: string;
  labelKey: string;
  color: string;
  filter: (a: Appointment) => boolean;
}

const columns: Column[] = [
  {
    key: "upcoming",
    labelKey: "upcoming",
    color: "border-t-slate-400",
    filter: (a) => a.status === "confirmed" || a.status === "pending",
  },
  {
    key: "waiting",
    labelKey: "waiting",
    color: "border-t-amber-500",
    filter: (a) => a.status === "waiting",
  },
  {
    key: "in-progress",
    labelKey: "inProgress",
    color: "border-t-blue-500",
    filter: (a) => a.status === "in-progress",
  },
  {
    key: "completed",
    labelKey: "completed",
    color: "border-t-green-500",
    filter: (a) => a.status === "completed",
  },
];

export function AppointmentBoard({ appointments, onAction }: AppointmentBoardProps) {
  const t = useTranslations("reception");

  const grouped = useMemo(() => {
    const result: Record<string, Appointment[]> = {};
    for (const col of columns) {
      result[col.key] = appointments
        .filter(col.filter)
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    return result;
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((col) => (
        <div
          key={col.key}
          className={`rounded-lg border border-border bg-muted/30 border-t-4 ${col.color}`}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {t(col.labelKey)}
            </h3>
            <span className="text-xs font-english text-muted-foreground rounded-full bg-muted px-2 py-0.5">
              {grouped[col.key]?.length ?? 0}
            </span>
          </div>
          <div className="space-y-2 p-2 min-h-[200px]">
            {grouped[col.key]?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {t("noAppointments")}
              </p>
            ) : (
              grouped[col.key]?.map((appointment) => (
                <BoardCard
                  key={appointment.id}
                  appointment={appointment}
                  onAction={onAction}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
