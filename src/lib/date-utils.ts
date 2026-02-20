import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { TimePeriod, DateRange } from "@/types";

/**
 * Convert a preset period to an actual date range.
 * Week starts on Saturday (weekStartsOn: 6) per project convention.
 */
export function getDateRangeForPeriod(period: TimePeriod): DateRange | null {
  if (period === "custom") return null;

  const now = new Date();
  const weekOptions = { weekStartsOn: 6 as const };

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "thisWeek":
      return { start: startOfWeek(now, weekOptions), end: endOfWeek(now, weekOptions) };
    case "thisMonth":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "thisQuarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "thisYear":
      return { start: startOfYear(now), end: endOfYear(now) };
    default:
      return null;
  }
}
