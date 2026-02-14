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

export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: ClientStatus;
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string;
  joinDate: string;
}

export type EmployeeStatus = "active" | "on-leave" | "inactive";

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  specialties: string;
  status: EmployeeStatus;
  appointments: number;
  revenue: number;
  rating: number;
  hireDate: string;
}

// Services
export type ServiceStatus = "active" | "inactive";

export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: ServiceStatus;
  bookings: number;
}

// Doctors
export type DoctorStatus = "active" | "on-leave" | "inactive";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  status: DoctorStatus;
  rating: number;
  consultations: number;
  licenseNumber: string;
}

// Inventory
export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: InventoryStatus;
}

// Expenses
export type ExpenseStatus = "approved" | "pending" | "rejected";

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  status: ExpenseStatus;
}

// Finance
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
}

// Marketing
export type CampaignStatus = "active" | "paused" | "completed" | "draft";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  reach: number;
  conversions: number;
}

// Reports
export type ReportType = "financial" | "appointments" | "clients" | "employees" | "inventory" | "marketing";

export interface Report {
  id: string;
  type: ReportType;
  name: string;
  description: string;
  lastGenerated: string;
  downloads: number;
  fileSize: string;
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
