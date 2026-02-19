"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface BulkAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  label?: string;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClearSelection,
  label,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "sticky bottom-4 z-40 mx-auto w-fit animate-in fade-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg ring-1 ring-black/5">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {label}
        </span>

        <div className="h-5 w-px bg-border" />

        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant ?? "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}

        <div className="h-5 w-px bg-border" />

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
