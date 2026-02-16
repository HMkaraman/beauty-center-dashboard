import { KPIData, MiniKPIData, ChartDataPoint, DonutSegment, ProfitabilityData, QuickAction, TopEmployee, Appointment, Client, Employee, Service, Doctor, InventoryItem, Expense, Transaction, Campaign, Report } from "@/types";
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
  { name: "common.months.january", revenue: 38000, expenses: 25000 },
  { name: "common.months.february", revenue: 42000, expenses: 27000 },
  { name: "common.months.march", revenue: 35000, expenses: 23000 },
  { name: "common.months.april", revenue: 48000, expenses: 30000 },
  { name: "common.months.may", revenue: 52000, expenses: 32000 },
  { name: "common.months.june", revenue: 45000, expenses: 28000 },
  { name: "common.months.july", revenue: 40000, expenses: 26000 },
  { name: "common.months.august", revenue: 38000, expenses: 24000 },
  { name: "common.months.september", revenue: 44000, expenses: 29000 },
  { name: "common.months.october", revenue: 50000, expenses: 31000 },
  { name: "common.months.november", revenue: 47000, expenses: 30000 },
  { name: "common.months.december", revenue: 55000, expenses: 35000 },
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
  { name: "common.days.saturday", appointments: 45 },
  { name: "common.days.sunday", appointments: 52 },
  { name: "common.days.monday", appointments: 38 },
  { name: "common.days.tuesday", appointments: 41 },
  { name: "common.days.wednesday", appointments: 55 },
  { name: "common.days.thursday", appointments: 48 },
  { name: "common.days.friday", appointments: 30 },
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
  { id: "record-expense", labelKey: "dashboard.recordExpense", icon: "Receipt", color: "#E07B7B", route: "/finance" },
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

// Clients Page Data

export const clientsKpiData: KPIData[] = [
  {
    id: "total-clients",
    label: "clients.totalClients",
    value: 324,
    change: 6.2,
    icon: "Users",
    format: "number",
  },
  {
    id: "active-clients",
    label: "clients.activeClients",
    value: 286,
    change: 4.8,
    icon: "UserPlus",
    format: "number",
  },
  {
    id: "inactive-clients",
    label: "clients.inactiveClients",
    value: 38,
    change: -2.1,
    icon: "UserCog",
    format: "number",
  },
  {
    id: "total-revenue",
    label: "clients.totalRevenue",
    value: 487500,
    change: 12.5,
    icon: "DollarSign",
    format: "currency",
  },
];

export const clientsByStatusData: DonutSegment[] = [
  { name: "clients.statusActive", value: 286, color: CHART_COLORS.green },
  { name: "clients.statusInactive", value: 38, color: CHART_COLORS.muted },
];

export const clientsGrowthData: ChartDataPoint[] = [
  { name: "common.months.january", value: 180 },
  { name: "common.months.february", value: 195 },
  { name: "common.months.march", value: 210 },
  { name: "common.months.april", value: 222 },
  { name: "common.months.may", value: 238 },
  { name: "common.months.june", value: 248 },
  { name: "common.months.july", value: 260 },
  { name: "common.months.august", value: 271 },
  { name: "common.months.september", value: 285 },
  { name: "common.months.october", value: 298 },
  { name: "common.months.november", value: 312 },
  { name: "common.months.december", value: 324 },
];

export const clientsListData: Client[] = [
  {
    id: "c1",
    name: "فاطمة المنصور",
    phone: "0551234567",
    email: "fatima@example.com",
    status: "active",
    totalAppointments: 24,
    totalSpent: 8400,
    lastVisit: "2025-01-10",
    joinDate: "2024-03-15",
  },
  {
    id: "c2",
    name: "نوف العبدالله",
    phone: "0559876543",
    email: "nouf@example.com",
    status: "active",
    totalAppointments: 18,
    totalSpent: 9000,
    lastVisit: "2025-01-12",
    joinDate: "2024-02-20",
  },
  {
    id: "c3",
    name: "منال الحربي",
    phone: "0553456789",
    email: "manal@example.com",
    status: "active",
    totalAppointments: 32,
    totalSpent: 14400,
    lastVisit: "2025-01-14",
    joinDate: "2023-11-05",
  },
  {
    id: "c4",
    name: "عبير السبيعي",
    phone: "0557654321",
    email: "abeer@example.com",
    status: "inactive",
    totalAppointments: 5,
    totalSpent: 1500,
    lastVisit: "2024-09-20",
    joinDate: "2024-06-10",
  },
  {
    id: "c5",
    name: "هيا الغامدي",
    phone: "0552345678",
    email: "haya@example.com",
    status: "active",
    totalAppointments: 15,
    totalSpent: 3000,
    lastVisit: "2025-01-08",
    joinDate: "2024-05-22",
  },
  {
    id: "c6",
    name: "ريان المطيري",
    phone: "0558765432",
    email: "rayan@example.com",
    status: "active",
    totalAppointments: 28,
    totalSpent: 22400,
    lastVisit: "2025-01-15",
    joinDate: "2023-08-14",
  },
  {
    id: "c7",
    name: "دانة الشهري",
    phone: "0554567890",
    email: "dana@example.com",
    status: "inactive",
    totalAppointments: 3,
    totalSpent: 450,
    lastVisit: "2024-07-03",
    joinDate: "2024-04-18",
  },
  {
    id: "c8",
    name: "لطيفة القرني",
    phone: "0556789012",
    email: "latifa@example.com",
    status: "active",
    totalAppointments: 20,
    totalSpent: 7000,
    lastVisit: "2025-01-11",
    joinDate: "2024-01-09",
  },
  {
    id: "c9",
    name: "أميرة الزهراني",
    phone: "0550123456",
    email: "amira@example.com",
    status: "active",
    totalAppointments: 12,
    totalSpent: 6000,
    lastVisit: "2025-01-09",
    joinDate: "2024-07-30",
  },
  {
    id: "c10",
    name: "سلمى العنزي",
    phone: "0553210987",
    email: "salma@example.com",
    status: "active",
    totalAppointments: 8,
    totalSpent: 9600,
    lastVisit: "2025-01-13",
    joinDate: "2024-09-12",
  },
];

// Employees Page Data

export const employeesKpiData: KPIData[] = [
  {
    id: "total-employees",
    label: "employees.totalEmployees",
    value: 10,
    change: 5.0,
    icon: "Users",
    format: "number",
  },
  {
    id: "active-employees",
    label: "employees.activeEmployees",
    value: 7,
    change: 3.2,
    icon: "UserCog",
    format: "number",
  },
  {
    id: "on-leave-employees",
    label: "employees.onLeaveEmployees",
    value: 2,
    change: -1.5,
    icon: "Clock",
    format: "number",
  },
  {
    id: "employees-revenue",
    label: "employees.totalRevenue",
    value: 600000,
    change: 10.8,
    icon: "DollarSign",
    format: "currency",
  },
];

export const employeesByDepartmentData: DonutSegment[] = [
  { name: "employees.deptSkincare", value: 3, color: DONUT_COLORS[0] },
  { name: "employees.deptLaser", value: 2, color: DONUT_COLORS[1] },
  { name: "employees.deptHair", value: 2, color: DONUT_COLORS[2] },
  { name: "employees.deptMakeup", value: 1, color: DONUT_COLORS[3] },
  { name: "employees.deptNails", value: 1, color: DONUT_COLORS[4] },
  { name: "employees.deptManagement", value: 1, color: DONUT_COLORS[5] },
];

export const employeesRevenueData: ChartDataPoint[] = [
  { name: "نورة الأحمد", value: 98500 },
  { name: "سارة العتيبي", value: 87200 },
  { name: "هند القحطاني", value: 72300 },
  { name: "لمى الشمري", value: 65800 },
  { name: "ريم الدوسري", value: 54200 },
];

export const employeesListData: Employee[] = [
  {
    id: "e1",
    name: "نورة الأحمد",
    phone: "0551112233",
    email: "noura@example.com",
    role: "أخصائية بشرة",
    specialties: "تنظيف بشرة، حقن بوتوكس",
    status: "active",
    appointments: 245,
    revenue: 98500,
    rating: 4.9,
    hireDate: "2022-03-01",
  },
  {
    id: "e2",
    name: "سارة العتيبي",
    phone: "0552223344",
    email: "sara@example.com",
    role: "أخصائية ليزر",
    specialties: "ليزر إزالة الشعر، ليزر تجميلي",
    status: "active",
    appointments: 198,
    revenue: 87200,
    rating: 4.8,
    hireDate: "2022-06-15",
  },
  {
    id: "e3",
    name: "هند القحطاني",
    phone: "0553334455",
    email: "hind@example.com",
    role: "مصففة شعر",
    specialties: "قص، صبغة، تصفيف",
    status: "active",
    appointments: 312,
    revenue: 72300,
    rating: 4.7,
    hireDate: "2021-11-20",
  },
  {
    id: "e4",
    name: "لمى الشمري",
    phone: "0554445566",
    email: "lama@example.com",
    role: "خبيرة مكياج",
    specialties: "مكياج عروس، مكياج سهرات",
    status: "on-leave",
    appointments: 176,
    revenue: 65800,
    rating: 4.8,
    hireDate: "2023-01-10",
  },
  {
    id: "e5",
    name: "ريم الدوسري",
    phone: "0555556677",
    email: "reem@example.com",
    role: "أخصائية أظافر",
    specialties: "مانيكير، بديكير، أظافر جل",
    status: "active",
    appointments: 289,
    revenue: 54200,
    rating: 4.6,
    hireDate: "2023-04-05",
  },
  {
    id: "e6",
    name: "عائشة الحربي",
    phone: "0556667788",
    email: "aisha@example.com",
    role: "أخصائية بشرة",
    specialties: "تقشير كيميائي، ميزوثيرابي",
    status: "active",
    appointments: 156,
    revenue: 62400,
    rating: 4.5,
    hireDate: "2023-07-20",
  },
  {
    id: "e7",
    name: "مها العنزي",
    phone: "0557778899",
    email: "maha@example.com",
    role: "أخصائية ليزر",
    specialties: "ليزر كربوني، ليزر تفتيح",
    status: "active",
    appointments: 134,
    revenue: 58900,
    rating: 4.7,
    hireDate: "2023-09-01",
  },
  {
    id: "e8",
    name: "جواهر المالكي",
    phone: "0558889900",
    email: "jawaher@example.com",
    role: "مصففة شعر",
    specialties: "كيراتين، بروتين، علاج شعر",
    status: "on-leave",
    appointments: 98,
    revenue: 39200,
    rating: 4.4,
    hireDate: "2024-01-15",
  },
  {
    id: "e9",
    name: "وعد الغامدي",
    phone: "0559990011",
    email: "waad@example.com",
    role: "أخصائية بشرة",
    specialties: "هيدرافيشل، تنظيف عميق",
    status: "active",
    appointments: 87,
    revenue: 34800,
    rating: 4.6,
    hireDate: "2024-03-10",
  },
  {
    id: "e10",
    name: "أروى القرني",
    phone: "0550001122",
    email: "arwa@example.com",
    role: "مديرة",
    specialties: "إدارة، تنسيق",
    status: "inactive",
    appointments: 0,
    revenue: 0,
    rating: 0,
    hireDate: "2021-06-01",
  },
];

export const employeeRoles = [
  "أخصائية بشرة",
  "أخصائية ليزر",
  "مصففة شعر",
  "خبيرة مكياج",
  "أخصائية أظافر",
  "مديرة",
];

// Services Page Data

export const servicesKpiData: KPIData[] = [
  { id: "total-services", label: "services.totalServices", value: 24, change: 4.2, icon: "Scissors", format: "number" },
  { id: "active-services", label: "services.activeServices", value: 22, change: 2.1, icon: "CheckCircle", format: "number" },
  { id: "avg-price", label: "services.averagePrice", value: 425, change: 5.3, icon: "DollarSign", format: "currency" },
  { id: "monthly-bookings", label: "services.monthlyBookings", value: 1247, change: 8.7, icon: "CalendarDays", format: "number" },
];

export const servicesByCategoryData: DonutSegment[] = [
  { name: "services.catSkincare", value: 6, color: DONUT_COLORS[0] },
  { name: "services.catLaser", value: 4, color: DONUT_COLORS[1] },
  { name: "services.catHair", value: 5, color: DONUT_COLORS[2] },
  { name: "services.catMakeup", value: 4, color: DONUT_COLORS[3] },
  { name: "services.catNails", value: 3, color: DONUT_COLORS[4] },
  { name: "services.catBody", value: 2, color: DONUT_COLORS[5] },
];

export const servicesBookingsTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 95 },
  { name: "common.months.february", value: 102 },
  { name: "common.months.march", value: 88 },
  { name: "common.months.april", value: 110 },
  { name: "common.months.may", value: 118 },
  { name: "common.months.june", value: 105 },
  { name: "common.months.july", value: 92 },
  { name: "common.months.august", value: 85 },
  { name: "common.months.september", value: 108 },
  { name: "common.months.october", value: 115 },
  { name: "common.months.november", value: 112 },
  { name: "common.months.december", value: 125 },
];

export const servicesListData: Service[] = [
  { id: "s1", name: "تنظيف بشرة عميق", category: "العناية بالبشرة", duration: 60, price: 350, status: "active", bookings: 245 },
  { id: "s2", name: "جلسة ليزر إزالة شعر", category: "الليزر", duration: 45, price: 500, status: "active", bookings: 198 },
  { id: "s3", name: "صبغة شعر كاملة", category: "العناية بالشعر", duration: 90, price: 450, status: "active", bookings: 156 },
  { id: "s4", name: "مكياج سهرة", category: "المكياج", duration: 60, price: 300, status: "active", bookings: 132 },
  { id: "s5", name: "مانيكير وبديكير", category: "الأظافر", duration: 75, price: 200, status: "active", bookings: 289 },
  { id: "s6", name: "حقن بوتوكس", category: "العناية بالبشرة", duration: 30, price: 800, status: "active", bookings: 87 },
  { id: "s7", name: "قص وتصفيف شعر", category: "العناية بالشعر", duration: 45, price: 150, status: "active", bookings: 312 },
  { id: "s8", name: "مكياج عروس", category: "المكياج", duration: 120, price: 1200, status: "active", bookings: 45 },
  { id: "s9", name: "تقشير كيميائي", category: "العناية بالبشرة", duration: 45, price: 600, status: "active", bookings: 76 },
  { id: "s10", name: "ليزر كربوني", category: "الليزر", duration: 30, price: 550, status: "inactive", bookings: 34 },
];

export const serviceCategories = [
  "العناية بالبشرة",
  "الليزر",
  "العناية بالشعر",
  "المكياج",
  "الأظافر",
  "العناية بالجسم",
];

// Doctors Page Data

export const doctorsKpiData: KPIData[] = [
  { id: "total-doctors", label: "doctors.totalDoctors", value: 5, change: 0, icon: "Stethoscope", format: "number" },
  { id: "active-doctors", label: "doctors.activeDoctors", value: 4, change: 0, icon: "UserCheck", format: "number" },
  { id: "avg-rating", label: "doctors.averageRating", value: 4.7, change: 2.1, icon: "Star", format: "number" },
  { id: "total-consultations", label: "doctors.totalConsultations", value: 324, change: 6.5, icon: "ClipboardList", format: "number" },
];

export const doctorsBySpecialtyData: DonutSegment[] = [
  { name: "doctors.specDermatology", value: 2, color: DONUT_COLORS[0] },
  { name: "doctors.specCosmeticSurgery", value: 1, color: DONUT_COLORS[1] },
  { name: "doctors.specAesthetics", value: 1, color: DONUT_COLORS[2] },
  { name: "doctors.specLaser", value: 1, color: DONUT_COLORS[3] },
];

export const doctorsConsultationsTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 22 },
  { name: "common.months.february", value: 25 },
  { name: "common.months.march", value: 28 },
  { name: "common.months.april", value: 24 },
  { name: "common.months.may", value: 30 },
  { name: "common.months.june", value: 27 },
  { name: "common.months.july", value: 26 },
  { name: "common.months.august", value: 23 },
  { name: "common.months.september", value: 29 },
  { name: "common.months.october", value: 32 },
  { name: "common.months.november", value: 28 },
  { name: "common.months.december", value: 30 },
];

export const doctorsListData: Doctor[] = [
  { id: "d1", name: "د. أحمد الراشد", specialty: "الأمراض الجلدية", phone: "0551001100", email: "dr.ahmed@example.com", status: "active", rating: 4.9, consultations: 98, licenseNumber: "MED-2019-001" },
  { id: "d2", name: "د. سلطان العمري", specialty: "الجراحة التجميلية", phone: "0552002200", email: "dr.sultan@example.com", status: "active", rating: 4.8, consultations: 76, licenseNumber: "MED-2018-015" },
  { id: "d3", name: "د. فهد الشهراني", specialty: "طب التجميل", phone: "0553003300", email: "dr.fahad@example.com", status: "active", rating: 4.6, consultations: 65, licenseNumber: "MED-2020-008" },
  { id: "d4", name: "د. خالد المنصور", specialty: "الليزر التجميلي", phone: "0554004400", email: "dr.khalid@example.com", status: "on-leave", rating: 4.7, consultations: 54, licenseNumber: "MED-2017-022" },
  { id: "d5", name: "د. عبدالله الحربي", specialty: "الأمراض الجلدية", phone: "0555005500", email: "dr.abdullah@example.com", status: "active", rating: 4.5, consultations: 31, licenseNumber: "MED-2021-003" },
];

export const doctorSpecialties = [
  "الأمراض الجلدية",
  "الجراحة التجميلية",
  "طب التجميل",
  "الليزر التجميلي",
];

// Inventory Page Data

export const inventoryKpiData: KPIData[] = [
  { id: "total-items", label: "inventory.totalItems", value: 156, change: 3.4, icon: "Package", format: "number" },
  { id: "low-stock", label: "inventory.lowStock", value: 12, change: -8.2, icon: "AlertTriangle", format: "number" },
  { id: "total-value", label: "inventory.totalValue", value: 87500, change: 5.1, icon: "DollarSign", format: "currency" },
  { id: "out-of-stock", label: "inventory.outOfStock", value: 3, change: -2.0, icon: "PackageX", format: "number" },
];

export const inventoryByCategoryData: DonutSegment[] = [
  { name: "inventory.catSkincare", value: 45, color: DONUT_COLORS[0] },
  { name: "inventory.catHairProducts", value: 32, color: DONUT_COLORS[1] },
  { name: "inventory.catTools", value: 28, color: DONUT_COLORS[2] },
  { name: "inventory.catConsumables", value: 35, color: DONUT_COLORS[3] },
  { name: "inventory.catEquipment", value: 16, color: DONUT_COLORS[4] },
];

export const inventoryStockTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 142 },
  { name: "common.months.february", value: 138 },
  { name: "common.months.march", value: 145 },
  { name: "common.months.april", value: 150 },
  { name: "common.months.may", value: 148 },
  { name: "common.months.june", value: 155 },
  { name: "common.months.july", value: 152 },
  { name: "common.months.august", value: 149 },
  { name: "common.months.september", value: 158 },
  { name: "common.months.october", value: 160 },
  { name: "common.months.november", value: 154 },
  { name: "common.months.december", value: 156 },
];

export const inventoryListData: InventoryItem[] = [
  { id: "inv1", name: "كريم ترطيب للبشرة", sku: "SKN-001", category: "منتجات العناية بالبشرة", quantity: 45, unitPrice: 120, totalValue: 5400, status: "in-stock" },
  { id: "inv2", name: "سيروم فيتامين سي", sku: "SKN-002", category: "منتجات العناية بالبشرة", quantity: 8, unitPrice: 250, totalValue: 2000, status: "low-stock" },
  { id: "inv3", name: "شامبو كيراتين", sku: "HAR-001", category: "منتجات الشعر", quantity: 32, unitPrice: 85, totalValue: 2720, status: "in-stock" },
  { id: "inv4", name: "صبغة شعر - أشقر", sku: "HAR-002", category: "منتجات الشعر", quantity: 0, unitPrice: 65, totalValue: 0, status: "out-of-stock" },
  { id: "inv5", name: "قفازات طبية", sku: "CON-001", category: "مستهلكات", quantity: 500, unitPrice: 2, totalValue: 1000, status: "in-stock" },
  { id: "inv6", name: "جهاز ليزر ديود", sku: "EQP-001", category: "أجهزة", quantity: 2, unitPrice: 15000, totalValue: 30000, status: "in-stock" },
  { id: "inv7", name: "مقص احترافي", sku: "TLS-001", category: "أدوات", quantity: 5, unitPrice: 350, totalValue: 1750, status: "low-stock" },
  { id: "inv8", name: "كريم واقي شمس", sku: "SKN-003", category: "منتجات العناية بالبشرة", quantity: 28, unitPrice: 95, totalValue: 2660, status: "in-stock" },
  { id: "inv9", name: "جل أظافر", sku: "NAL-001", category: "مستهلكات", quantity: 0, unitPrice: 45, totalValue: 0, status: "out-of-stock" },
  { id: "inv10", name: "بروتين شعر", sku: "HAR-003", category: "منتجات الشعر", quantity: 4, unitPrice: 180, totalValue: 720, status: "low-stock" },
];

export const inventoryCategories = [
  "منتجات العناية بالبشرة",
  "منتجات الشعر",
  "أدوات",
  "مستهلكات",
  "أجهزة",
];

// Expenses Page Data

export const expensesKpiData: KPIData[] = [
  { id: "total-expenses", label: "expenses.totalExpenses", value: 312000, change: 4.5, icon: "Receipt", format: "currency" },
  { id: "this-month", label: "expenses.thisMonth", value: 28500, change: -2.3, icon: "Calendar", format: "currency" },
  { id: "avg-monthly", label: "expenses.averageMonthly", value: 26000, change: 1.8, icon: "TrendingUp", format: "currency" },
  { id: "pending-approvals", label: "expenses.pendingApprovals", value: 5, change: -3.0, icon: "Clock", format: "number" },
];

export const expensesByCategoryData: DonutSegment[] = [
  { name: "expenses.catRent", value: 96000, color: DONUT_COLORS[0] },
  { name: "expenses.catSalaries", value: 120000, color: DONUT_COLORS[1] },
  { name: "expenses.catSupplies", value: 42000, color: DONUT_COLORS[2] },
  { name: "expenses.catUtilities", value: 24000, color: DONUT_COLORS[3] },
  { name: "expenses.catMarketing", value: 18000, color: DONUT_COLORS[4] },
  { name: "expenses.catMaintenance", value: 12000, color: DONUT_COLORS[5] },
];

export const expensesMonthlyTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 25000 },
  { name: "common.months.february", value: 27000 },
  { name: "common.months.march", value: 23000 },
  { name: "common.months.april", value: 30000 },
  { name: "common.months.may", value: 32000 },
  { name: "common.months.june", value: 28000 },
  { name: "common.months.july", value: 26000 },
  { name: "common.months.august", value: 24000 },
  { name: "common.months.september", value: 29000 },
  { name: "common.months.october", value: 31000 },
  { name: "common.months.november", value: 30000 },
  { name: "common.months.december", value: 28500 },
];

export const expensesListData: Expense[] = [
  { id: "exp1", date: "2025-01-15", description: "إيجار المركز - يناير", category: "إيجار", amount: 8000, paymentMethod: "تحويل بنكي", status: "approved" },
  { id: "exp2", date: "2025-01-14", description: "رواتب الموظفات - يناير", category: "رواتب", amount: 10000, paymentMethod: "تحويل بنكي", status: "approved" },
  { id: "exp3", date: "2025-01-13", description: "مستلزمات تنظيف", category: "مستلزمات", amount: 1200, paymentMethod: "نقدي", status: "approved" },
  { id: "exp4", date: "2025-01-12", description: "فاتورة كهرباء", category: "مرافق", amount: 2500, paymentMethod: "سداد", status: "approved" },
  { id: "exp5", date: "2025-01-11", description: "إعلان انستغرام", category: "تسويق", amount: 1500, paymentMethod: "بطاقة ائتمان", status: "pending" },
  { id: "exp6", date: "2025-01-10", description: "صيانة أجهزة الليزر", category: "صيانة", amount: 3500, paymentMethod: "تحويل بنكي", status: "pending" },
  { id: "exp7", date: "2025-01-09", description: "منتجات عناية بالبشرة", category: "مستلزمات", amount: 4200, paymentMethod: "بطاقة ائتمان", status: "approved" },
  { id: "exp8", date: "2025-01-08", description: "فاتورة مياه", category: "مرافق", amount: 800, paymentMethod: "سداد", status: "approved" },
  { id: "exp9", date: "2025-01-07", description: "تجديد رخصة تجارية", category: "مستلزمات", amount: 2000, paymentMethod: "تحويل بنكي", status: "rejected" },
  { id: "exp10", date: "2025-01-06", description: "تدريب موظفات", category: "رواتب", amount: 3000, paymentMethod: "تحويل بنكي", status: "pending" },
];

export const expenseCategories = [
  "إيجار",
  "رواتب",
  "مستلزمات",
  "مرافق",
  "تسويق",
  "صيانة",
];

export const paymentMethods = [
  "نقدي",
  "بطاقة ائتمان",
  "تحويل بنكي",
  "سداد",
];

// Finance Page Data

export const financeKpiData: KPIData[] = [
  { id: "total-revenue", label: "finance.totalRevenue", value: 487500, change: 12.5, icon: "TrendingUp", format: "currency" },
  { id: "total-expenses", label: "finance.totalExpenses", value: 312000, change: 4.5, icon: "TrendingDown", format: "currency" },
  { id: "net-profit", label: "finance.netProfit", value: 175500, change: 18.2, icon: "DollarSign", format: "currency" },
  { id: "profit-margin", label: "finance.profitMargin", value: 36, change: 3.1, icon: "Percent", format: "percentage" },
];

export const financeRevenueByCategoryData: DonutSegment[] = [
  { name: "finance.catSkincare", value: 146250, color: DONUT_COLORS[0] },
  { name: "finance.catLaser", value: 107250, color: DONUT_COLORS[1] },
  { name: "finance.catHair", value: 82875, color: DONUT_COLORS[2] },
  { name: "finance.catMakeup", value: 63375, color: DONUT_COLORS[3] },
  { name: "finance.catNails", value: 53625, color: DONUT_COLORS[4] },
  { name: "finance.catOther", value: 34125, color: DONUT_COLORS[5] },
];

export const financeRevenueExpensesTrendData: ChartDataPoint[] = [
  { name: "common.months.january", revenue: 38000, expenses: 25000 },
  { name: "common.months.february", revenue: 42000, expenses: 27000 },
  { name: "common.months.march", revenue: 35000, expenses: 23000 },
  { name: "common.months.april", revenue: 48000, expenses: 30000 },
  { name: "common.months.may", revenue: 52000, expenses: 32000 },
  { name: "common.months.june", revenue: 45000, expenses: 28000 },
  { name: "common.months.july", revenue: 40000, expenses: 26000 },
  { name: "common.months.august", revenue: 38000, expenses: 24000 },
  { name: "common.months.september", revenue: 44000, expenses: 29000 },
  { name: "common.months.october", revenue: 50000, expenses: 31000 },
  { name: "common.months.november", revenue: 47000, expenses: 30000 },
  { name: "common.months.december", revenue: 55000, expenses: 35000 },
];

export const financeTransactionsData: Transaction[] = [
  { id: "t1", date: "2025-01-15", description: "إيرادات خدمات البشرة", category: "العناية بالبشرة", type: "income", amount: 12500 },
  { id: "t2", date: "2025-01-15", description: "إيجار المركز", category: "إيجار", type: "expense", amount: 8000 },
  { id: "t3", date: "2025-01-14", description: "إيرادات جلسات الليزر", category: "الليزر", type: "income", amount: 9800 },
  { id: "t4", date: "2025-01-14", description: "رواتب الموظفات", category: "رواتب", type: "expense", amount: 10000 },
  { id: "t5", date: "2025-01-13", description: "إيرادات خدمات الشعر", category: "العناية بالشعر", type: "income", amount: 7200 },
  { id: "t6", date: "2025-01-13", description: "مستلزمات طبية", category: "مستلزمات", type: "expense", amount: 3200 },
  { id: "t7", date: "2025-01-12", description: "إيرادات المكياج", category: "المكياج", type: "income", amount: 5400 },
  { id: "t8", date: "2025-01-12", description: "فاتورة كهرباء", category: "مرافق", type: "expense", amount: 2500 },
  { id: "t9", date: "2025-01-11", description: "إيرادات الأظافر", category: "الأظافر", type: "income", amount: 4200 },
  { id: "t10", date: "2025-01-11", description: "إعلانات تسويقية", category: "تسويق", type: "expense", amount: 1500 },
];

export const financeCategories = [
  "العناية بالبشرة",
  "الليزر",
  "العناية بالشعر",
  "المكياج",
  "الأظافر",
  "إيجار",
  "رواتب",
  "مستلزمات",
  "مرافق",
  "تسويق",
];

export const transactionTypes = [
  { value: "income", label: "إيرادات" },
  { value: "expense", label: "مصروفات" },
];

// Marketing Page Data

export const marketingKpiData: KPIData[] = [
  { id: "active-campaigns", label: "marketing.activeCampaigns", value: 4, change: 0, icon: "Megaphone", format: "number" },
  { id: "total-reach", label: "marketing.totalReach", value: 45200, change: 15.3, icon: "Eye", format: "number" },
  { id: "conversion-rate", label: "marketing.conversionRate", value: 3.8, change: 0.5, icon: "Target", format: "percentage" },
  { id: "roi", label: "marketing.roi", value: 285, change: 12.0, icon: "TrendingUp", format: "percentage" },
];

export const marketingByChannelData: DonutSegment[] = [
  { name: "marketing.chInstagram", value: 5, color: DONUT_COLORS[0] },
  { name: "marketing.chSnapchat", value: 3, color: DONUT_COLORS[1] },
  { name: "marketing.chGoogleAds", value: 2, color: DONUT_COLORS[2] },
  { name: "marketing.chSMS", value: 2, color: DONUT_COLORS[3] },
  { name: "marketing.chTikTok", value: 1, color: DONUT_COLORS[4] },
];

export const marketingReachTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 28000 },
  { name: "common.months.february", value: 32000 },
  { name: "common.months.march", value: 29000 },
  { name: "common.months.april", value: 35000 },
  { name: "common.months.may", value: 38000 },
  { name: "common.months.june", value: 42000 },
  { name: "common.months.july", value: 36000 },
  { name: "common.months.august", value: 33000 },
  { name: "common.months.september", value: 40000 },
  { name: "common.months.october", value: 44000 },
  { name: "common.months.november", value: 41000 },
  { name: "common.months.december", value: 45200 },
];

export const marketingCampaignsData: Campaign[] = [
  { id: "mc1", name: "حملة رمضان", channel: "Instagram", status: "completed", startDate: "2025-03-01", endDate: "2025-03-30", budget: 5000, reach: 15200, conversions: 580 },
  { id: "mc2", name: "عروض الصيف", channel: "Snapchat", status: "active", startDate: "2025-06-01", endDate: "2025-08-31", budget: 3500, reach: 8900, conversions: 320 },
  { id: "mc3", name: "إعلان جوجل - ليزر", channel: "Google Ads", status: "active", startDate: "2025-01-01", endDate: "2025-12-31", budget: 2000, reach: 12400, conversions: 450 },
  { id: "mc4", name: "رسائل SMS عملاء", channel: "SMS", status: "active", startDate: "2025-01-01", endDate: "2025-06-30", budget: 800, reach: 3200, conversions: 180 },
  { id: "mc5", name: "تيك توك - قبل وبعد", channel: "TikTok", status: "active", startDate: "2025-04-01", endDate: "2025-09-30", budget: 4000, reach: 22000, conversions: 290 },
  { id: "mc6", name: "حملة اليوم الوطني", channel: "Instagram", status: "draft", startDate: "2025-09-20", endDate: "2025-09-25", budget: 3000, reach: 0, conversions: 0 },
  { id: "mc7", name: "عروض نهاية العام", channel: "Snapchat", status: "paused", startDate: "2025-11-15", endDate: "2025-12-31", budget: 2500, reach: 5600, conversions: 120 },
  { id: "mc8", name: "إعلان جوجل - بشرة", channel: "Google Ads", status: "completed", startDate: "2024-06-01", endDate: "2024-12-31", budget: 1800, reach: 9800, conversions: 380 },
];

export const marketingChannels = [
  "Instagram",
  "Snapchat",
  "Google Ads",
  "SMS",
  "TikTok",
];

// Reports Page Data

export const reportsKpiData: KPIData[] = [
  { id: "generated-reports", label: "reports.generatedReports", value: 48, change: 6.7, icon: "FileText", format: "number" },
  { id: "scheduled-reports", label: "reports.scheduledReports", value: 6, change: 0, icon: "Clock", format: "number" },
  { id: "downloads-month", label: "reports.downloadsThisMonth", value: 124, change: 12.3, icon: "Download", format: "number" },
  { id: "shared-reports", label: "reports.sharedReports", value: 18, change: 4.5, icon: "Share2", format: "number" },
];

export const reportsByTypeData: DonutSegment[] = [
  { name: "reports.typeFinancial", value: 12, color: DONUT_COLORS[0] },
  { name: "reports.typeAppointments", value: 10, color: DONUT_COLORS[1] },
  { name: "reports.typeClients", value: 8, color: DONUT_COLORS[2] },
  { name: "reports.typeEmployees", value: 7, color: DONUT_COLORS[3] },
  { name: "reports.typeInventory", value: 6, color: DONUT_COLORS[4] },
  { name: "reports.typeMarketing", value: 5, color: DONUT_COLORS[5] },
];

export const reportsDownloadsTrendData: ChartDataPoint[] = [
  { name: "common.months.january", value: 85 },
  { name: "common.months.february", value: 92 },
  { name: "common.months.march", value: 78 },
  { name: "common.months.april", value: 105 },
  { name: "common.months.may", value: 110 },
  { name: "common.months.june", value: 98 },
  { name: "common.months.july", value: 88 },
  { name: "common.months.august", value: 95 },
  { name: "common.months.september", value: 102 },
  { name: "common.months.october", value: 115 },
  { name: "common.months.november", value: 120 },
  { name: "common.months.december", value: 124 },
];

export const reportsListData: Report[] = [
  { id: "r1", type: "financial", name: "تقرير الإيرادات الشهري", description: "ملخص شامل للإيرادات والمصروفات الشهرية مع تحليل الاتجاهات", lastGenerated: "2025-01-15", downloads: 24, fileSize: "2.4 MB" },
  { id: "r2", type: "appointments", name: "تقرير المواعيد الأسبوعي", description: "تحليل المواعيد المكتملة والملغاة ونسب الحضور", lastGenerated: "2025-01-14", downloads: 18, fileSize: "1.8 MB" },
  { id: "r3", type: "clients", name: "تقرير العملاء الجدد", description: "إحصائيات العملاء الجدد ومعدلات الاحتفاظ", lastGenerated: "2025-01-13", downloads: 15, fileSize: "1.2 MB" },
  { id: "r4", type: "employees", name: "تقرير أداء الموظفات", description: "تقييم أداء الموظفات من حيث الإيرادات والمواعيد والتقييمات", lastGenerated: "2025-01-12", downloads: 12, fileSize: "1.5 MB" },
  { id: "r5", type: "inventory", name: "تقرير حالة المخزون", description: "حالة المخزون الحالية والمنتجات منخفضة المخزون", lastGenerated: "2025-01-11", downloads: 8, fileSize: "0.9 MB" },
  { id: "r6", type: "marketing", name: "تقرير أداء الحملات", description: "تحليل أداء الحملات التسويقية ومعدلات التحويل", lastGenerated: "2025-01-10", downloads: 10, fileSize: "2.1 MB" },
  { id: "r7", type: "financial", name: "تقرير الأرباح والخسائر", description: "تقرير شامل للأرباح والخسائر مع مقارنة بالفترات السابقة", lastGenerated: "2025-01-09", downloads: 20, fileSize: "3.2 MB" },
  { id: "r8", type: "clients", name: "تقرير رضا العملاء", description: "تحليل استبيانات رضا العملاء والتقييمات", lastGenerated: "2025-01-08", downloads: 14, fileSize: "1.6 MB" },
  { id: "r9", type: "appointments", name: "تقرير الخدمات الأكثر طلباً", description: "ترتيب الخدمات حسب الطلب مع تحليل الإيرادات لكل خدمة", lastGenerated: "2025-01-07", downloads: 16, fileSize: "1.4 MB" },
];

export const reportTypes = [
  { value: "financial", label: "مالي" },
  { value: "appointments", label: "مواعيد" },
  { value: "clients", label: "عملاء" },
  { value: "employees", label: "موظفين" },
  { value: "inventory", label: "مخزون" },
  { value: "marketing", label: "تسويق" },
];
