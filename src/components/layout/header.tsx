"use client";

import { useTranslations } from "next-intl";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/useFilterStore";
import { TimePeriod } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TIME_PERIODS: { key: TimePeriod; labelKey: string }[] = [
  { key: "today", labelKey: "filters.today" },
  { key: "thisWeek", labelKey: "filters.thisWeek" },
  { key: "thisMonth", labelKey: "filters.thisMonth" },
  { key: "thisQuarter", labelKey: "filters.thisQuarter" },
  { key: "thisYear", labelKey: "filters.thisYear" },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations();
  const { period, setPeriod } = useFilterStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Page title */}
        <h1 className="text-lg font-bold text-foreground md:text-xl">
          {title || t("dashboard.title")}
        </h1>

        {/* Time filter pills — hidden on mobile */}
        <div className="hidden items-center gap-1 rounded-lg bg-secondary/50 p-1 md:flex">
          {TIME_PERIODS.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === key
                  ? "bg-gold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
          </button>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-gold/15 text-xs text-gold">
              م
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
