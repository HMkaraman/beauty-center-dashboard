"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
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
import { MobileAppointmentList } from "./mobile-appointment-list";
import { usePermissions } from "@/hooks/use-permissions";
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
const COLUMN_TO_STATUS: Record<string, string> = {
  upcoming: "confirmed",
  waiting: "waiting",
  "in-progress": "in-progress",
  completed: "completed",
};

export function AppointmentBoard({ appointments, onAction }: AppointmentBoardProps) {
  const t = useTranslations("reception");
  const { can } = usePermissions();
  const canEdit = can("appointments:write");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSourceColumn, setActiveSourceColumn] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // Local status overrides for instant visual feedback (same render cycle as drag end)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  // Clear overrides when real data arrives from the server
  const prevAppointmentsRef = useRef(appointments);
  useEffect(() => {
    if (prevAppointmentsRef.current !== appointments) {
      prevAppointmentsRef.current = appointments;
      setStatusOverrides({});
    }
  }, [appointments]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  // Apply local overrides on top of real data for instant visual updates
  const effectiveAppointments = useMemo(() => {
    if (Object.keys(statusOverrides).length === 0) return appointments;
    return appointments.map((a) =>
      statusOverrides[a.id]
        ? { ...a, status: statusOverrides[a.id] as Appointment["status"] }
        : a
    );
  }, [appointments, statusOverrides]);

  const grouped = useMemo(() => {
    const result: Record<string, Appointment[]> = {};
    for (const col of columns) {
      result[col.key] = effectiveAppointments
        .filter(col.filter)
        .sort((a, b) => a.time.localeCompare(b.time));
    }
    return result;
  }, [effectiveAppointments]);

  const activeAppointment = useMemo(
    () => (activeId ? effectiveAppointments.find((a) => a.id === activeId) : null),
    [activeId, effectiveAppointments]
  );

  const isValidDrop = useCallback(
    (sourceColumn: string | null, targetColumn: string | null) => {
      if (!sourceColumn || !targetColumn) return false;
      if (sourceColumn === targetColumn) return false;
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

      if (!over) {
        setActiveId(null);
        setActiveSourceColumn(null);
        setOverColumn(null);
        return;
      }

      const sourceColumn = active.data.current?.columnKey as string;
      const targetColumn = over.id as string;
      const targetStatus = COLUMN_TO_STATUS[targetColumn];

      if (sourceColumn === targetColumn || !isValidDrop(sourceColumn, targetColumn) || !targetStatus) {
        setActiveId(null);
        setActiveSourceColumn(null);
        setOverColumn(null);
        return;
      }

      // All state updates in the same batch:
      // 1. Clear drag state (overlay disappears)
      // 2. Set local override (card instantly appears in new column)
      setActiveId(null);
      setActiveSourceColumn(null);
      setOverColumn(null);
      setStatusOverrides((prev) => ({ ...prev, [active.id as string]: targetStatus }));

      // Fire the API call (parent handles optimistic cache + rollback)
      onAction(active.id as string, targetStatus);
    },
    [isValidDrop, onAction]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveSourceColumn(null);
    setOverColumn(null);
  }, []);

  return (
    <>
      {/* Mobile: grouped list with status selects */}
      <div className="block sm:hidden">
        <MobileAppointmentList
          appointments={effectiveAppointments}
          onAction={onAction}
          canEdit={canEdit}
        />
      </div>

      {/* Desktop/tablet: drag-and-drop Kanban board */}
      <div className="hidden sm:block">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <AnimatePresence mode="popLayout">
                  {grouped[col.key]?.length === 0 ? (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground text-center py-8"
                    >
                      {t("noAppointments")}
                    </motion.p>
                  ) : (
                    grouped[col.key]?.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0 } }}
                        transition={{ layout: { type: "spring", stiffness: 500, damping: 35 }, opacity: { duration: 0.15 } }}
                      >
                        {col.key === "completed" ? (
                          <BoardCard
                            appointment={appointment}
                            onAction={onAction}
                            canEdit={canEdit}
                          />
                        ) : (
                          <DraggableCard
                            appointment={appointment}
                            columnKey={col.key}
                            onAction={onAction}
                            canEdit={canEdit}
                          />
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
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
      </div>
    </>
  );
}
