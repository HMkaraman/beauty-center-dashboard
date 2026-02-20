"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/useFilterStore";
import { TimePeriod } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PRESET_PERIODS: { key: Exclude<TimePeriod, "custom">; labelKey: string }[] = [
  { key: "today", labelKey: "filters.today" },
  { key: "thisWeek", labelKey: "filters.thisWeek" },
  { key: "thisMonth", labelKey: "filters.thisMonth" },
  { key: "thisQuarter", labelKey: "filters.thisQuarter" },
  { key: "thisYear", labelKey: "filters.thisYear" },
];

export function HeaderDateFilter() {
  const t = useTranslations();
  const { period, dateRange, setPeriod, setDateRange } = useFilterStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(dateRange?.start);
  const [toDate, setToDate] = useState<Date | undefined>(dateRange?.end);

  const handlePresetClick = (key: Exclude<TimePeriod, "custom">) => {
    setPeriod(key);
  };

  const handleApplyCustom = () => {
    if (fromDate && toDate) {
      setDateRange({ start: fromDate, end: toDate });
      setPeriod("custom");
      setPopoverOpen(false);
    }
  };

  const customLabel =
    period === "custom" && dateRange
      ? `${format(dateRange.start, "MMM d")} – ${format(dateRange.end, "MMM d")}`
      : t("filters.custom");

  return (
    <div className="hidden items-center gap-1 rounded-lg bg-secondary/50 p-1 md:flex">
      {PRESET_PERIODS.map(({ key, labelKey }) => (
        <button
          key={key}
          onClick={() => handlePresetClick(key)}
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

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              period === "custom"
                ? "bg-gold text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {customLabel}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("filters.from")}
                </label>
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("filters.to")}
                </label>
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  disabled={(date) => (fromDate ? date < fromDate : false)}
                  className="rounded-md border"
                />
              </div>
            </div>
            <Button
              onClick={handleApplyCustom}
              disabled={!fromDate || !toDate}
              className="w-full"
              size="sm"
            >
              {t("filters.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
