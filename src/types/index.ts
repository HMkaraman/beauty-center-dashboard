export interface KPIData {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: string;
  format: "currency" | "number" | "percentage";
}

export interface MiniKPIData {
  id: string;
  label: string;
  value: number | string;
  format: "currency" | "number" | "percentage" | "text";
}

export interface ChartDataPoint {
  name: string;
  revenue?: number;
  expenses?: number;
  appointments?: number;
  value?: number;
}

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

export interface NavItem {
  id: string;
  labelKey: string;
  icon: string;
  route: string;
  isMVP: boolean;
}

export interface ProfitabilityData {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  previousMargin: number;
}

export interface QuickAction {
  id: string;
  labelKey: string;
  icon: string;
  color: string;
  route: string;
}

export interface TopEmployee {
  id: string;
  name: string;
  role: string;
  revenue: number;
  appointments: number;
}

export type TimePeriod = "today" | "thisWeek" | "thisMonth" | "thisQuarter" | "thisYear";

export interface DateRange {
  start: Date;
  end: Date;
}

export type Locale = "ar" | "en";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show";

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  employee: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  price: number;
}
