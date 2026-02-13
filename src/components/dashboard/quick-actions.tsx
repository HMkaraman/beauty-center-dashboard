"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { QuickAction } from "@/types";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.route}
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${action.color}20` }}
          >
            <DynamicIcon
              name={action.icon}
              className="h-5 w-5"
              style={{ color: action.color }}
            />
          </div>
          <span className="text-xs text-foreground">{t(action.labelKey)}</span>
        </Link>
      ))}
    </div>
  );
}
