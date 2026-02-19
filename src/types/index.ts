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
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  status: ClientStatus;
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string;
  joinDate: string;
}

// Client Detail types
export type ClientValueTier = "vip" | "regular" | "at-risk" | "new";

export interface ClientKPIs {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalSpent: number;
  averageSpendPerVisit: number;
  lastVisitDate: string | null;
  cancellationRate: number;
  clientLifetimeDays: number;
  visitFrequencyDays: number;
}

export interface ClientAnalytics {
  favoriteServices: { serviceName: string; count: number }[];
  preferredEmployees: { employeeName: string; count: number }[];
  valueTier: ClientValueTier;
  monthlyVisits: { month: string; count: number }[];
}

export interface ClientDetailResponse {
  client: Client & { notes: string | null };
  kpis: ClientKPIs;
  analytics: ClientAnalytics;
  recentAppointments: Appointment[];
  recentInvoices: Invoice[];
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
  nationalId?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  salary?: number;
  notes?: string;
}

// Employee Detail types
export type EmployeePerformanceTier = "star" | "solid" | "growing" | "new";

export interface EmployeeKPIs {
  totalAppointments: number;
  completedAppointments: number;
  revenueGenerated: number;
  avgRevenuePerVisit: number;
  commissionEarned: number;
  uniqueClients: number;
  clientRetentionRate: number;
  cancellationRate: number;
  utilizationRate: number;
}

export interface EmployeeAnalytics {
  topServices: { serviceName: string; count: number }[];
  topClients: { clientName: string; count: number }[];
  performanceTier: EmployeePerformanceTier;
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface EmployeeCommission {
  id: string;
  invoiceId: string;
  amount: number;
  rate: number;
  date: string;
  clientName?: string;
}

export interface EmployeeDetailResponse {
  employee: Employee & { commissionRate: number; image: string | null; salary: number; nationalId: string; passportNumber: string; dateOfBirth: string; address: string; emergencyContact: string; notes: string };
  kpis: EmployeeKPIs;
  analytics: EmployeeAnalytics;
  recentAppointments: Appointment[];
  recentCommissions: EmployeeCommission[];
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
  bio?: string;
  education?: string;
  certificates?: string;
  yearsOfExperience?: number;
  compensationType?: string;
  salary?: number;
  commissionRate?: number;
  notes?: string;
}

export interface DoctorCommission {
  id: string;
  invoiceId: string;
  amount: number;
  rate: number;
  date: string;
  clientName?: string;
}

// Doctor Detail types
export type DoctorPerformanceTier = "star" | "solid" | "growing" | "new";

export interface DoctorKPIs {
  totalConsultations: number;
  completedConsultations: number;
  revenueGenerated: number;
  avgRevenuePerConsultation: number;
  commissionEarned: number;
  uniquePatients: number;
  patientRetentionRate: number;
  cancellationRate: number;
  lastConsultationDate: string | null;
  rating: number;
}

export interface DoctorAnalytics {
  topProcedures: { serviceName: string; count: number }[];
  topPatients: { clientName: string; count: number }[];
  performanceTier: DoctorPerformanceTier;
  monthlyConsultations: { month: string; count: number }[];
}

export interface DoctorDetailResponse {
  doctor: Doctor & { image: string | null; commissionRate: number; salary: number; compensationType: string; bio: string; education: string; certificates: string; yearsOfExperience: number; notes: string };
  kpis: DoctorKPIs;
  analytics: DoctorAnalytics;
  recentAppointments: Appointment[];
  recentCommissions: DoctorCommission[];
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

// Invoices
export type InvoiceStatus = "paid" | "unpaid" | "void";
export type InvoicePaymentMethod = "cash" | "card" | "bank_transfer";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientPhone: string;
  appointmentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: InvoicePaymentMethod;
  notes?: string;
}

// Healing Journeys
export type HealingJourneyStatus = "active" | "completed" | "paused";

export interface HealingJourney {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  status: HealingJourneyStatus;
  startDate: string;
  endDate?: string;
  primaryServiceId?: string;
  entriesCount: number;
  createdAt: string;
}

export type JourneyEntryType = "session" | "prescription" | "note" | "photo" | "milestone";

export type AttachmentLabel = "before" | "after" | "during" | "prescription_scan" | "general";

export interface JourneyAttachment {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  label?: AttachmentLabel;
  bodyRegion?: string;
  caption?: string;
}

interface BaseEntry {
  id: string;
  journeyId: string;
  type: JourneyEntryType;
  date: string;
  notes?: string;
  attachments: JourneyAttachment[];
  createdAt: string;
}

export type SessionEntry = BaseEntry & {
  type: "session";
  serviceName?: string;
  doctorName?: string;
  employeeName?: string;
  price?: number;
  duration?: number;
  appointmentId?: string;
  invoiceId?: string;
};

export type PrescriptionEntry = BaseEntry & {
  type: "prescription";
  prescriptionText?: string;
  prescribedByDoctorName?: string;
};

export type NoteEntry = BaseEntry & {
  type: "note";
};

export type PhotoEntry = BaseEntry & {
  type: "photo";
};

export type MilestoneEntry = BaseEntry & {
  type: "milestone";
  milestoneLabel?: string;
};

export type JourneyEntry = SessionEntry | PrescriptionEntry | NoteEntry | PhotoEntry | MilestoneEntry;

export type Locale = "ar" | "en";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show";

export interface Appointment {
  id: string;
  clientId?: string;
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
