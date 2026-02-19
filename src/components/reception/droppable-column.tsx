"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";

interface DroppableColumnProps {
  columnKey: string;
  labelKey: string;
  color: string;
  count: number;
  isValidDrop: boolean;
  isOver: boolean;
  children: React.ReactNode;
}

export function DroppableColumn({
  columnKey,
  labelKey,
  color,
  count,
  isValidDrop,
  isOver,
  children,
}: DroppableColumnProps) {
  const t = useTranslations("reception");
  const { setNodeRef } = useDroppable({ id: columnKey });

  let ringClass = "";
  if (isOver) {
    ringClass = isValidDrop
      ? "ring-2 ring-green-500/50 bg-green-50/30 dark:bg-green-950/20"
      : "ring-2 ring-red-500/50 bg-red-50/30 dark:bg-red-950/20";
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-border bg-muted/30 border-t-4 ${color} transition-all duration-200 ${ringClass}`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          {t(labelKey)}
        </h3>
        <span className="text-xs font-english text-muted-foreground rounded-full bg-muted px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="space-y-2 p-2 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
