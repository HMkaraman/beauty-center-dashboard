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

export type TimePeriod = "today" | "thisWeek" | "thisMonth" | "thisQuarter" | "thisYear" | "custom";

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

// Sections
export type SectionStatus = "active" | "inactive";

export interface Section {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  color?: string;
  status: SectionStatus;
  sortOrder: number;
  employeeCount?: number;
  doctorCount?: number;
  employeeIds?: string[];
  doctorIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// Service Categories
export interface ServiceCategory {
  id: string;
  name: string;
  nameEn?: string;
  sectionId?: string;
  sortOrder: number;
  createdAt: string;
}

// Services
export type ServiceStatus = "active" | "inactive";

export type ServiceType = "laser" | "injectable" | null;

export interface Service {
  id: string;
  name: string;
  nameEn?: string;
  categoryId?: string;
  category: string;
  duration: number;
  price: number;
  status: ServiceStatus;
  bookings: number;
  image?: string;
  description?: string;
  serviceType?: ServiceType;
  laserMinShots?: number;
  laserMaxShots?: number;
  injectableUnit?: string;
  injectableExpiryDays?: number;
}

// Service Detail types
export interface ServiceKPIs {
  totalBookings: number;
  totalRevenue: number;
  avgRevenuePerBooking: number;
  uniqueClients: number;
  cancellationRate: number;
  lastBooked: string | null;
}

export interface ServiceAnalytics {
  topEmployees: { employeeName: string; count: number }[];
  topClients: { clientName: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface ServiceDetailResponse {
  service: Service & { description: string | null };
  kpis: ServiceKPIs;
  analytics: ServiceAnalytics;
  recentAppointments: Appointment[];
  inventoryRequirements: { id: string; inventoryItemId: string; inventoryItemName: string; quantityRequired: number }[];
  assignedEmployees: { id: string; name: string; role: string }[];
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
export type ProductType = "injectable" | "skincare" | "consumable" | "retail" | "equipment" | "device_supply" | "medication" | "chemical";
export type StorageCondition = "ambient" | "refrigerated" | "frozen";
export type UnitOfMeasure = "units" | "ml" | "cc" | "syringe" | "vial" | "piece" | "box" | "g" | "bottle" | "tube" | "ampule" | "sachet";

export interface InventoryCategory {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  color?: string;
  isActive: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameEn?: string;
  sku: string;
  barcode?: string;
  description?: string;
  image?: string;
  brand?: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  productType?: ProductType;
  unitOfMeasure?: UnitOfMeasure;
  unitsPerPackage?: number;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  totalValue: number;
  reorderLevel?: number;
  expiryDate?: string;
  batchNumber?: string;
  isRetail: number;
  isActive: number;
  supplierName?: string;
  storageConditions?: StorageCondition;
  notes?: string;
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
export type InvoiceStatus = "paid" | "unpaid" | "void" | "partially_paid";
export type InvoicePaymentMethod = "cash" | "card" | "bank_transfer";
export type InvoiceType = "standard" | "simplified" | "credit_note" | "debit_note";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  serviceId?: string;
  taxCategory?: string;
  taxRate?: number;
  taxAmount?: number;
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
  // GCC/MENA e-invoicing fields
  uuid?: string;
  invoiceType?: InvoiceType;
  originalInvoiceId?: string;
  buyerTrn?: string;
  buyerName?: string;
  buyerAddress?: string;
  qrCode?: string;
  zatcaStatus?: string;
  currency?: string;
  discountTotal?: number;
}

// Finance Overview
export interface FinanceOverview {
  revenue: number;
  revenueChange: number;
  expenses: number;
  expensesChange: number;
  netProfit: number;
  netProfitChange: number;
  margin: number;
  taxCollected: number;
  outstandingAmount: number;
  outstandingCount: number;
  invoiceCount: number;
  revenueByService: DonutSegment[];
  monthlyTrend: ChartDataPoint[];
  expenseBreakdown: DonutSegment[];
  period: { startDate: string; endDate: string };
}

// P&L Report
export interface PLReportLine {
  code: string;
  name: string;
  nameEn: string;
  amount: number;
}

export interface PLReport {
  period: { startDate: string; endDate: string };
  revenue: { lines: PLReportLine[]; total: number };
  taxCollected: number;
  totalRevenue: number;
  expenses: { lines: PLReportLine[]; total: number };
  netProfit: number;
  margin: number;
}

// Tax Summary
export interface TaxCategoryBreakdown {
  category: string;
  categoryLabel: { ar: string; en: string };
  taxRate: number;
  taxableAmount: number;
  vatAmount: number;
  itemCount: number;
}

export interface TaxSummary {
  period: { startDate: string; endDate: string };
  outputVat: { taxableAmount: number; vatAmount: number; invoiceCount: number };
  netVatPayable: number;
  byCategory: TaxCategoryBreakdown[];
  monthly: { month: string; taxableAmount: number; vatAmount: number; invoiceCount: number }[];
}

// Payment tracking
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: string;
}

// Expense Categories
export interface ExpenseCategory {
  id: string;
  name: string;
  nameEn?: string;
  code?: string;
  parentId?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Chart of Accounts
export interface Account {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  type: string;
  parentCode?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
}

// Daily Settlement
export interface DailySettlement {
  id: string;
  date: string;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  bankTransferSales: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  status: string;
  notes?: string;
}

// Financial Period
export interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  snapshotRevenue?: number;
  snapshotExpenses?: number;
  snapshotProfit?: number;
  closedAt?: string;
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

// Activity Logs
export type ActivityEntityType =
  | "appointment"
  | "client"
  | "employee"
  | "doctor"
  | "invoice"
  | "expense"
  | "service"
  | "inventory_item"
  | "campaign"
  | "transaction";

export type ActivityAction = "create" | "update" | "delete" | "note";

export interface ActivityLogAttachment {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  entityType: ActivityEntityType;
  entityId: string;
  action: ActivityAction;
  userId?: string;
  userName?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  content?: string;
  entityLabel?: string;
  attachments: ActivityLogAttachment[];
  createdAt: string;
}

// Consumption Tracking
export type ConsumptionType = "laser_shots" | "injectable";
export type ShotDeviation = "within_range" | "below" | "above";
export type ReservationStatus = "active" | "used" | "expired" | "disposed";

export interface SessionConsumptionLog {
  id: string;
  tenantId: string;
  appointmentId: string;
  serviceId?: string;
  clientId?: string;
  consumptionType: ConsumptionType;
  actualShots?: number;
  expectedMinShots?: number;
  expectedMaxShots?: number;
  shotDeviation?: ShotDeviation;
  inventoryItemId?: string;
  productName?: string;
  totalAllocated?: number;
  amountUsed?: number;
  leftoverAmount?: number;
  unit?: string;
  deviceId?: string;
  deviceModel?: string;
  notes?: string;
  recordedById?: string;
  createdAt: string;
}

export interface ClientProductReservation {
  id: string;
  tenantId: string;
  clientId: string;
  consumptionLogId: string;
  inventoryItemId?: string;
  productName: string;
  leftoverAmount: number;
  remainingAmount: number;
  unit: string;
  originalAppointmentId?: string;
  openedDate?: string;
  expiryDate?: string;
  expiryDays?: number;
  status: ReservationStatus;
  touchUpAppointmentId?: string;
  touchUpDate?: string;
  touchUpAmountUsed?: number;
  touchUpIsFree?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  clientName?: string;
  clientPhone?: string;
}

export interface LeftoverDashboardData {
  activeCount: number;
  expiringSoonCount: number;
  monthlyExpiredCount: number;
  expiringSoonList: (ClientProductReservation & { clientName: string; daysLeft: number })[];
}

export type Locale = "ar" | "en";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show" | "waiting" | "in-progress";

export interface AppointmentAttachment {
  id: string;
  appointmentId: string;
  url: string;
  filename?: string;
  mimeType?: string;
  label?: "before" | "after" | "during" | "general";
  caption?: string;
  createdAt: string;
}

export interface AppointmentRecurrence {
  id: string;
  groupId: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  interval: number;
  endDate?: string;
  occurrences?: number;
}

export interface AppointmentKPIs {
  clientVisitCount: number;
  clientTotalSpend: number;
  servicePopularity: number;
  employeeCompletionRate: number;
}

export interface AppointmentDetailResponse {
  appointment: Appointment;
  kpis: AppointmentKPIs;
  groupAppointments: Appointment[];
  attachments: AppointmentAttachment[];
  recurrence: AppointmentRecurrence | null;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  serviceId?: string;
  service: string;
  employeeId?: string;
  employee: string;
  doctorId?: string;
  doctor?: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  price: number;
  groupId?: string;
}

// Roles & Permissions
export interface RoleType {
  id: string;
  tenantId: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  isDefault: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string | null;
  roleName?: string | null;
  roleNameEn?: string | null;
  roleSlug?: string | null;
  customPermissions?: { granted: string[]; revoked: string[] } | null;
  image?: string | null;
  createdAt: string;
  updatedAt?: string;
}
