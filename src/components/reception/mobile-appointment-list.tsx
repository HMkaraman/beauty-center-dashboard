"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { BoardCard } from "./board-card";
import { StatusSelect } from "./status-select";
import { Appointment } from "@/types";

interface MobileAppointmentListProps {
  appointments: Appointment[];
  onAction: (id: string, action: string) => void;
}

interface Section {
  key: string;
  labelKey: string;
  dotColor: string;
  filter: (a: Appointment) => boolean;
}

const sections: Section[] = [
  {
    key: "upcoming",
    labelKey: "upcoming",
    dotColor: "bg-slate-400",
    filter: (a) => a.status === "confirmed" || a.status === "pending",
  },
  {
    key: "waiting",
    labelKey: "waiting",
    dotColor: "bg-amber-500",
    filter: (a) => a.status === "waiting",
  },
  {
    key: "in-progress",
    labelKey: "inProgress",
    dotColor: "bg-blue-500",
    filter: (a) => a.status === "in-progress",
  },
  {
    key: "completed",
    labelKey: "completed",
    dotColor: "bg-green-500",
    filter: (a) => a.status === "completed",
  },
];

export function MobileAppointmentList({
  appointments,
  onAction,
}: MobileAppointmentListProps) {
  const t = useTranslations("reception");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const result: Record<string, Appointment[]> = {};
    for (const sec of sections) {
      result[sec.key] = appointments
        .filter(sec.filter)
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    return result;
  }, [appointments]);

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {sections.map((sec) => {
        const items = grouped[sec.key] ?? [];
        const isCollapsed = collapsed[sec.key] ?? false;

        return (
          <div key={sec.key} className="rounded-lg border border-border">
            {/* Section header */}
            <button
              onClick={() => toggleCollapse(sec.key)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium"
            >
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${sec.dotColor}`} />
              <span>{t(sec.labelKey)}</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({items.length})
              </span>
              <ChevronDown
                className={`ms-auto h-4 w-4 text-muted-foreground transition-transform ${
                  isCollapsed ? "-rotate-90 rtl:rotate-90" : ""
                }`}
              />
            </button>

            {/* Section cards */}
            {!isCollapsed && (
              <div className="px-3 pb-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t("noAppointments")}
                  </p>
                ) : (
                  items.map((appt) => (
                    <div key={appt.id} className="space-y-1.5">
                      <BoardCard appointment={appt} onAction={onAction} />
                      {appt.status !== "completed" && (
                        <StatusSelect
                          currentStatus={appt.status}
                          onMove={(newStatus) => onAction(appt.id, newStatus)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
