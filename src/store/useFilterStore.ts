import { create } from "zustand";
import { TimePeriod, DateRange } from "@/types";

interface FilterState {
  period: TimePeriod;
  dateRange: DateRange | null;
  setPeriod: (period: TimePeriod) => void;
  setDateRange: (range: DateRange | null) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  period: "thisMonth",
  dateRange: null,
  setPeriod: (period) => set({ period }),
  setDateRange: (dateRange) => set({ dateRange }),
}));
