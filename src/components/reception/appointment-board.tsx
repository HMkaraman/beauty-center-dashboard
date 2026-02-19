"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { DroppableColumn } from "./droppable-column";
import { DraggableCard } from "./draggable-card";
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

// Map column key to the status value for the API
// Moving to "upcoming" sets status to "confirmed"
const COLUMN_TO_STATUS: Record<string, string> = {
  upcoming: "confirmed",
  waiting: "waiting",
  "in-progress": "in-progress",
  completed: "completed",
};

export function AppointmentBoard({ appointments, onAction }: AppointmentBoardProps) {
  const t = useTranslations("reception");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSourceColumn, setActiveSourceColumn] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const grouped = useMemo(() => {
    const result: Record<string, Appointment[]> = {};
    for (const col of columns) {
      result[col.key] = appointments
        .filter(col.filter)
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    return result;
  }, [appointments]);

  const activeAppointment = useMemo(
    () => (activeId ? appointments.find((a) => a.id === activeId) : null),
    [activeId, appointments]
  );

  const isValidDrop = useCallback(
    (sourceColumn: string | null, targetColumn: string | null) => {
      if (!sourceColumn || !targetColumn) return false;
      if (sourceColumn === targetColumn) return false;
      // Completed cards cannot be moved
      if (sourceColumn === "completed") return false;
      return true;
    },
    []
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveSourceColumn((active.data.current?.columnKey as string) ?? null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverColumn(over ? (over.id as string) : null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveSourceColumn(null);
      setOverColumn(null);

      if (!over) return;

      const sourceColumn = active.data.current?.columnKey as string;
      const targetColumn = over.id as string;

      if (sourceColumn === targetColumn) return;
      if (!isValidDrop(sourceColumn, targetColumn)) return;

      const targetStatus = COLUMN_TO_STATUS[targetColumn];
      if (targetStatus) {
        onAction(active.id as string, targetStatus);
      }
    },
    [isValidDrop, onAction]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveSourceColumn(null);
    setOverColumn(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <DroppableColumn
            key={col.key}
            columnKey={col.key}
            labelKey={col.labelKey}
            color={col.color}
            count={grouped[col.key]?.length ?? 0}
            isValidDrop={isValidDrop(activeSourceColumn, col.key)}
            isOver={overColumn === col.key && activeSourceColumn !== col.key}
          >
            {grouped[col.key]?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {t("noAppointments")}
              </p>
            ) : (
              grouped[col.key]?.map((appointment) => (
                col.key === "completed" ? (
                  <BoardCard
                    key={appointment.id}
                    appointment={appointment}
                    onAction={onAction}
                  />
                ) : (
                  <DraggableCard
                    key={appointment.id}
                    appointment={appointment}
                    columnKey={col.key}
                    onAction={onAction}
                  />
                )
              ))
            )}
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeAppointment ? (
          <BoardCard
            appointment={activeAppointment}
            onAction={() => {}}
            className="shadow-lg ring-2 ring-primary/30 rotate-2"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
