import { KPIData, MiniKPIData, ChartDataPoint, DonutSegment, ProfitabilityData, QuickAction, TopEmployee, Appointment } from "@/types";
import { DONUT_COLORS, CHART_COLORS } from "@/constants/colors";

export const kpiData: KPIData[] = [
  {
    id: "total-revenue",
    label: "dashboard.totalRevenue",
    value: 487500,
    change: 12.5,
    icon: "DollarSign",
    format: "currency",
  },
  {
    id: "total-appointments",
    label: "dashboard.totalAppointments",
    value: 1247,
    change: 8.3,
    icon: "CalendarDays",
    format: "number",
  },
  {
    id: "new-clients",
    label: "dashboard.newClients",
    value: 89,
    change: -3.2,
    icon: "UserPlus",
    format: "number",
  },
  {
    id: "avg-service-value",
    label: "dashboard.avgServiceValue",
    value: 391,
    change: 5.7,
    icon: "TrendingUp",
    format: "currency",
  },
];

export const profitabilityData: ProfitabilityData = {
  revenue: 487500,
  expenses: 312000,
  profit: 175500,
  margin: 36,
  previousMargin: 32,
};

export const revenueExpensesData: ChartDataPoint[] = [
  { name: "يناير", revenue: 38000, expenses: 25000 },
  { name: "فبراير", revenue: 42000, expenses: 27000 },
  { name: "مارس", revenue: 35000, expenses: 23000 },
  { name: "أبريل", revenue: 48000, expenses: 30000 },
  { name: "مايو", revenue: 52000, expenses: 32000 },
  { name: "يونيو", revenue: 45000, expenses: 28000 },
  { name: "يوليو", revenue: 40000, expenses: 26000 },
  { name: "أغسطس", revenue: 38000, expenses: 24000 },
  { name: "سبتمبر", revenue: 44000, expenses: 29000 },
  { name: "أكتوبر", revenue: 50000, expenses: 31000 },
  { name: "نوفمبر", revenue: 47000, expenses: 30000 },
  { name: "ديسمبر", revenue: 55000, expenses: 35000 },
];

export const revenueByServiceData: DonutSegment[] = [
  { name: "العناية بالبشرة", value: 146250, color: DONUT_COLORS[0] },
  { name: "الليزر", value: 107250, color: DONUT_COLORS[1] },
  { name: "العناية بالشعر", value: 82875, color: DONUT_COLORS[2] },
  { name: "المكياج", value: 63375, color: DONUT_COLORS[3] },
  { name: "الأظافر", value: 53625, color: DONUT_COLORS[4] },
  { name: "أخرى", value: 34125, color: DONUT_COLORS[5] },
];

export const appointmentsTrendData: ChartDataPoint[] = [
  { name: "السبت", appointments: 45 },
  { name: "الأحد", appointments: 52 },
  { name: "الإثنين", appointments: 38 },
  { name: "الثلاثاء", appointments: 41 },
  { name: "الأربعاء", appointments: 55 },
  { name: "الخميس", appointments: 48 },
  { name: "الجمعة", appointments: 30 },
];

export const topEmployees: TopEmployee[] = [
  { id: "1", name: "نورة الأحمد", role: "أخصائية بشرة", revenue: 98500, appointments: 245 },
  { id: "2", name: "سارة العتيبي", role: "أخصائية ليزر", revenue: 87200, appointments: 198 },
  { id: "3", name: "هند القحطاني", role: "مصففة شعر", revenue: 72300, appointments: 312 },
  { id: "4", name: "لمى الشمري", role: "خبيرة مكياج", revenue: 65800, appointments: 176 },
  { id: "5", name: "ريم الدوسري", role: "أخصائية أظافر", revenue: 54200, appointments: 289 },
];

export const miniKpiData: MiniKPIData[] = [
  { id: "avg-service-time", label: "dashboard.avgServiceTime", value: "45 دقيقة", format: "text" },
  { id: "cancellation-rate", label: "dashboard.cancellationRate", value: 4.2, format: "percentage" },
  { id: "return-rate", label: "dashboard.returnRate", value: 68, format: "percentage" },
  { id: "satisfaction", label: "dashboard.satisfaction", value: 4.8, format: "number" },
  { id: "daily-services", label: "dashboard.dailyServices", value: 42, format: "number" },
  { id: "daily-revenue", label: "dashboard.dailyRevenue", value: 18500, format: "currency" },
];

export const quickActions: QuickAction[] = [
  { id: "new-appointment", labelKey: "dashboard.newAppointment", icon: "CalendarPlus", color: "#C4956A", route: "/appointments" },
  { id: "add-client", labelKey: "dashboard.addClient", icon: "UserPlus", color: "#7ECB8B", route: "/clients" },
  { id: "record-expense", labelKey: "dashboard.recordExpense", icon: "Receipt", color: "#E07B7B", route: "/expenses" },
  { id: "view-reports", labelKey: "dashboard.viewReports", icon: "BarChart3", color: "#8B7FF5", route: "/reports" },
];

// Appointments Page Data

export const appointmentsKpiData: KPIData[] = [
  {
    id: "total-appointments",
    label: "appointments.totalAppointments",
    value: 156,
    change: 8.3,
    icon: "CalendarDays",
    format: "number",
  },
  {
    id: "completed-appointments",
    label: "appointments.completedAppointments",
    value: 98,
    change: 12.1,
    icon: "CalendarCheck",
    format: "number",
  },
  {
    id: "cancelled-appointments",
    label: "appointments.cancelledAppointments",
    value: 12,
    change: -5.4,
    icon: "CalendarX",
    format: "number",
  },
  {
    id: "pending-appointments",
    label: "appointments.pendingAppointments",
    value: 46,
    change: 3.7,
    icon: "Clock",
    format: "number",
  },
];

export const appointmentsByStatusData: DonutSegment[] = [
  { name: "appointments.statusConfirmed", value: 42, color: CHART_COLORS.green },
  { name: "appointments.statusPending", value: 46, color: CHART_COLORS.yellow },
  { name: "appointments.statusCompleted", value: 98, color: CHART_COLORS.purple },
  { name: "appointments.statusCancelled", value: 12, color: CHART_COLORS.red },
  { name: "appointments.statusNoShow", value: 8, color: CHART_COLORS.muted },
];

export const appointmentsListData: Appointment[] = [
  {
    id: "1",
    clientName: "فاطمة المنصور",
    clientPhone: "0551234567",
    service: "تنظيف بشرة عميق",
    employee: "نورة الأحمد",
    date: "2025-01-15",
    time: "09:00",
    duration: 60,
    status: "confirmed",
    price: 350,
  },
  {
    id: "2",
    clientName: "نوف العبدالله",
    clientPhone: "0559876543",
    service: "جلسة ليزر",
    employee: "سارة العتيبي",
    date: "2025-01-15",
    time: "10:00",
    duration: 45,
    status: "completed",
    price: 500,
  },
  {
    id: "3",
    clientName: "منال الحربي",
    clientPhone: "0553456789",
    service: "صبغة شعر",
    employee: "هند القحطاني",
    date: "2025-01-15",
    time: "11:30",
    duration: 90,
    status: "pending",
    price: 450,
  },
  {
    id: "4",
    clientName: "عبير السبيعي",
    clientPhone: "0557654321",
    service: "مكياج سهرة",
    employee: "لمى الشمري",
    date: "2025-01-15",
    time: "13:00",
    duration: 60,
    status: "cancelled",
    price: 300,
  },
  {
    id: "5",
    clientName: "هيا الغامدي",
    clientPhone: "0552345678",
    service: "مانيكير وبديكير",
    employee: "ريم الدوسري",
    date: "2025-01-15",
    time: "14:00",
    duration: 75,
    status: "completed",
    price: 200,
  },
  {
    id: "6",
    clientName: "ريان المطيري",
    clientPhone: "0558765432",
    service: "حقن بوتوكس",
    employee: "نورة الأحمد",
    date: "2025-01-16",
    time: "09:30",
    duration: 30,
    status: "confirmed",
    price: 800,
  },
  {
    id: "7",
    clientName: "دانة الشهري",
    clientPhone: "0554567890",
    service: "قص وتصفيف شعر",
    employee: "هند القحطاني",
    date: "2025-01-16",
    time: "10:30",
    duration: 45,
    status: "no-show",
    price: 150,
  },
  {
    id: "8",
    clientName: "لطيفة القرني",
    clientPhone: "0556789012",
    service: "تنظيف بشرة عميق",
    employee: "نورة الأحمد",
    date: "2025-01-16",
    time: "12:00",
    duration: 60,
    status: "pending",
    price: 350,
  },
  {
    id: "9",
    clientName: "أميرة الزهراني",
    clientPhone: "0550123456",
    service: "جلسة ليزر",
    employee: "سارة العتيبي",
    date: "2025-01-16",
    time: "14:00",
    duration: 45,
    status: "confirmed",
    price: 500,
  },
  {
    id: "10",
    clientName: "سلمى العنزي",
    clientPhone: "0553210987",
    service: "مكياج عروس",
    employee: "لمى الشمري",
    date: "2025-01-17",
    time: "08:00",
    duration: 120,
    status: "pending",
    notes: "تجهيز كامل للعروس",
    price: 1200,
  },
];

export const servicesList = [
  { name: "تنظيف بشرة عميق", duration: 60, price: 350 },
  { name: "جلسة ليزر", duration: 45, price: 500 },
  { name: "صبغة شعر", duration: 90, price: 450 },
  { name: "مكياج سهرة", duration: 60, price: 300 },
  { name: "مانيكير وبديكير", duration: 75, price: 200 },
  { name: "حقن بوتوكس", duration: 30, price: 800 },
  { name: "قص وتصفيف شعر", duration: 45, price: 150 },
  { name: "مكياج عروس", duration: 120, price: 1200 },
];

export const employeesList = [
  { id: "1", name: "نورة الأحمد" },
  { id: "2", name: "سارة العتيبي" },
  { id: "3", name: "هند القحطاني" },
  { id: "4", name: "لمى الشمري" },
  { id: "5", name: "ريم الدوسري" },
];
