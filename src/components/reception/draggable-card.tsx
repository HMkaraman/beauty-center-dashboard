"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BoardCard } from "./board-card";
import { Appointment } from "@/types";

interface DraggableCardProps {
  appointment: Appointment;
  columnKey: string;
  onAction: (id: string, action: string) => void;
}

export function DraggableCard({ appointment, columnKey, onAction }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: { columnKey },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-30" : ""}
      {...listeners}
      {...attributes}
    >
      <BoardCard appointment={appointment} onAction={onAction} />
    </div>
  );
}
