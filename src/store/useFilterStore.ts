import { create } from "zustand";
import { TimePeriod, DateRange } from "@/types";
import { getDateRangeForPeriod } from "@/lib/date-utils";

interface FilterState {
  period: TimePeriod;
  dateRange: DateRange | null;
  setPeriod: (period: TimePeriod) => void;
  setDateRange: (range: DateRange | null) => void;
  getEffectiveDateRange: () => DateRange | null;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  period: "thisMonth",
  dateRange: null,
  setPeriod: (period) => set({ period, dateRange: period !== "custom" ? null : get().dateRange }),
  setDateRange: (dateRange) => set({ dateRange }),
  getEffectiveDateRange: () => {
    const { period, dateRange } = get();
    if (period === "custom") return dateRange;
    return getDateRangeForPeriod(period);
  },
}));
