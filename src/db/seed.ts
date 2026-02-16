import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "bcryptjs";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: "بيوتي سنتر",
      slug: "beauty-center",
      currency: "SAR",
      locale: "ar",
      timezone: "Asia/Riyadh",
      phone: "0500000000",
      email: "info@beautycenter.com",
    })
    .returning();

  console.log("✅ Tenant created:", tenant.id);
  const tenantId = tenant.id;

  // 2. Create admin user
  const passwordHash = await hash("admin123", 12);
  const [adminUser] = await db
    .insert(schema.users)
    .values({
      tenantId,
      email: "admin@beautycenter.com",
      passwordHash,
      name: "مدير النظام",
      role: "owner",
    })
    .returning();

  console.log("✅ Admin user created:", adminUser.email);

  // 3. Create employees
  const employeesData = [
    { name: "نورة الأحمد", phone: "0551112233", email: "noura@example.com", role: "أخصائية بشرة", specialties: "تنظيف بشرة، حقن بوتوكس", status: "active" as const, hireDate: new Date("2022-03-01") },
    { name: "سارة العتيبي", phone: "0552223344", email: "sara@example.com", role: "أخصائية ليزر", specialties: "ليزر إزالة الشعر، ليزر تجميلي", status: "active" as const, hireDate: new Date("2022-06-15") },
    { name: "هند القحطاني", phone: "0553334455", email: "hind@example.com", role: "مصففة شعر", specialties: "قص، صبغة، تصفيف", status: "active" as const, hireDate: new Date("2021-11-20") },
    { name: "لمى الشمري", phone: "0554445566", email: "lama@example.com", role: "خبيرة مكياج", specialties: "مكياج عروس، مكياج سهرات", status: "on-leave" as const, hireDate: new Date("2023-01-10") },
    { name: "ريم الدوسري", phone: "0555556677", email: "reem@example.com", role: "أخصائية أظافر", specialties: "مانيكير، بديكير، أظافر جل", status: "active" as const, hireDate: new Date("2023-04-05") },
    { name: "عائشة الحربي", phone: "0556667788", email: "aisha@example.com", role: "أخصائية بشرة", specialties: "تقشير كيميائي، ميزوثيرابي", status: "active" as const, hireDate: new Date("2023-07-20") },
    { name: "مها العنزي", phone: "0557778899", email: "maha@example.com", role: "أخصائية ليزر", specialties: "ليزر كربوني، ليزر تفتيح", status: "active" as const, hireDate: new Date("2023-09-01") },
    { name: "جواهر المالكي", phone: "0558889900", email: "jawaher@example.com", role: "مصففة شعر", specialties: "كيراتين، بروتين، علاج شعر", status: "on-leave" as const, hireDate: new Date("2024-01-15") },
    { name: "وعد الغامدي", phone: "0559990011", email: "waad@example.com", role: "أخصائية بشرة", specialties: "هيدرافيشل، تنظيف عميق", status: "active" as const, hireDate: new Date("2024-03-10") },
    { name: "أروى القرني", phone: "0550001122", email: "arwa@example.com", role: "مديرة", specialties: "إدارة، تنسيق", status: "inactive" as const, hireDate: new Date("2021-06-01") },
  ];

  const employees = await db
    .insert(schema.employees)
    .values(employeesData.map((e) => ({ ...e, tenantId })))
    .returning();

  console.log(`✅ ${employees.length} employees created`);

  // 4. Create clients
  const clientsData = [
    { name: "فاطمة المنصور", phone: "0551234567", email: "fatima@example.com", status: "active" as const, joinDate: new Date("2024-03-15") },
    { name: "نوف العبدالله", phone: "0559876543", email: "nouf@example.com", status: "active" as const, joinDate: new Date("2024-02-20") },
    { name: "منال الحربي", phone: "0553456789", email: "manal@example.com", status: "active" as const, joinDate: new Date("2023-11-05") },
    { name: "عبير السبيعي", phone: "0557654321", email: "abeer@example.com", status: "inactive" as const, joinDate: new Date("2024-06-10") },
    { name: "هيا الغامدي", phone: "0552345678", email: "haya@example.com", status: "active" as const, joinDate: new Date("2024-05-22") },
    { name: "ريان المطيري", phone: "0558765432", email: "rayan@example.com", status: "active" as const, joinDate: new Date("2023-08-14") },
    { name: "دانة الشهري", phone: "0554567890", email: "dana@example.com", status: "inactive" as const, joinDate: new Date("2024-04-18") },
    { name: "لطيفة القرني", phone: "0556789012", email: "latifa@example.com", status: "active" as const, joinDate: new Date("2024-01-09") },
    { name: "أميرة الزهراني", phone: "0550123456", email: "amira@example.com", status: "active" as const, joinDate: new Date("2024-07-30") },
    { name: "سلمى العنزي", phone: "0553210987", email: "salma@example.com", status: "active" as const, joinDate: new Date("2024-09-12") },
  ];

  const clients = await db
    .insert(schema.clients)
    .values(clientsData.map((c) => ({ ...c, tenantId })))
    .returning();

  console.log(`✅ ${clients.length} clients created`);

  // 5. Create doctors
  const doctorsData = [
    { name: "د. أحمد الراشد", specialty: "الأمراض الجلدية", phone: "0551001100", email: "dr.ahmed@example.com", status: "active" as const, rating: "4.90", licenseNumber: "MED-2019-001" },
    { name: "د. سلطان العمري", specialty: "الجراحة التجميلية", phone: "0552002200", email: "dr.sultan@example.com", status: "active" as const, rating: "4.80", licenseNumber: "MED-2018-015" },
    { name: "د. فهد الشهراني", specialty: "طب التجميل", phone: "0553003300", email: "dr.fahad@example.com", status: "active" as const, rating: "4.60", licenseNumber: "MED-2020-008" },
    { name: "د. خالد المنصور", specialty: "الليزر التجميلي", phone: "0554004400", email: "dr.khalid@example.com", status: "on-leave" as const, rating: "4.70", licenseNumber: "MED-2017-022" },
    { name: "د. عبدالله الحربي", specialty: "الأمراض الجلدية", phone: "0555005500", email: "dr.abdullah@example.com", status: "active" as const, rating: "4.50", licenseNumber: "MED-2021-003" },
  ];

  const doctors = await db
    .insert(schema.doctors)
    .values(doctorsData.map((d) => ({ ...d, tenantId })))
    .returning();

  console.log(`✅ ${doctors.length} doctors created`);

  // 6. Create services
  const servicesData = [
    { name: "تنظيف بشرة عميق", category: "العناية بالبشرة", duration: 60, price: "350", status: "active" as const },
    { name: "جلسة ليزر إزالة شعر", category: "الليزر", duration: 45, price: "500", status: "active" as const },
    { name: "صبغة شعر كاملة", category: "العناية بالشعر", duration: 90, price: "450", status: "active" as const },
    { name: "مكياج سهرة", category: "المكياج", duration: 60, price: "300", status: "active" as const },
    { name: "مانيكير وبديكير", category: "الأظافر", duration: 75, price: "200", status: "active" as const },
    { name: "حقن بوتوكس", category: "العناية بالبشرة", duration: 30, price: "800", status: "active" as const },
    { name: "قص وتصفيف شعر", category: "العناية بالشعر", duration: 45, price: "150", status: "active" as const },
    { name: "مكياج عروس", category: "المكياج", duration: 120, price: "1200", status: "active" as const },
    { name: "تقشير كيميائي", category: "العناية بالبشرة", duration: 45, price: "600", status: "active" as const },
    { name: "ليزر كربوني", category: "الليزر", duration: 30, price: "550", status: "inactive" as const },
  ];

  const services = await db
    .insert(schema.services)
    .values(servicesData.map((s) => ({ ...s, tenantId })))
    .returning();

  console.log(`✅ ${services.length} services created`);

  // 7. Create appointments
  const appointmentsData = [
    { clientId: clients[0].id, clientName: "فاطمة المنصور", clientPhone: "0551234567", serviceId: services[0].id, service: "تنظيف بشرة عميق", employeeId: employees[0].id, employee: "نورة الأحمد", date: "2025-01-15", time: "09:00", duration: 60, status: "confirmed" as const, price: "350" },
    { clientId: clients[1].id, clientName: "نوف العبدالله", clientPhone: "0559876543", serviceId: services[1].id, service: "جلسة ليزر", employeeId: employees[1].id, employee: "سارة العتيبي", date: "2025-01-15", time: "10:00", duration: 45, status: "completed" as const, price: "500" },
    { clientId: clients[2].id, clientName: "منال الحربي", clientPhone: "0553456789", serviceId: services[2].id, service: "صبغة شعر", employeeId: employees[2].id, employee: "هند القحطاني", date: "2025-01-15", time: "11:30", duration: 90, status: "pending" as const, price: "450" },
    { clientId: clients[3].id, clientName: "عبير السبيعي", clientPhone: "0557654321", serviceId: services[3].id, service: "مكياج سهرة", employeeId: employees[3].id, employee: "لمى الشمري", date: "2025-01-15", time: "13:00", duration: 60, status: "cancelled" as const, price: "300" },
    { clientId: clients[4].id, clientName: "هيا الغامدي", clientPhone: "0552345678", serviceId: services[4].id, service: "مانيكير وبديكير", employeeId: employees[4].id, employee: "ريم الدوسري", date: "2025-01-15", time: "14:00", duration: 75, status: "completed" as const, price: "200" },
    { clientId: clients[5].id, clientName: "ريان المطيري", clientPhone: "0558765432", serviceId: services[5].id, service: "حقن بوتوكس", employeeId: employees[0].id, employee: "نورة الأحمد", date: "2025-01-16", time: "09:30", duration: 30, status: "confirmed" as const, price: "800" },
    { clientId: clients[6].id, clientName: "دانة الشهري", clientPhone: "0554567890", serviceId: services[6].id, service: "قص وتصفيف شعر", employeeId: employees[2].id, employee: "هند القحطاني", date: "2025-01-16", time: "10:30", duration: 45, status: "no-show" as const, price: "150" },
    { clientId: clients[7].id, clientName: "لطيفة القرني", clientPhone: "0556789012", serviceId: services[0].id, service: "تنظيف بشرة عميق", employeeId: employees[0].id, employee: "نورة الأحمد", date: "2025-01-16", time: "12:00", duration: 60, status: "pending" as const, price: "350" },
    { clientId: clients[8].id, clientName: "أميرة الزهراني", clientPhone: "0550123456", serviceId: services[1].id, service: "جلسة ليزر", employeeId: employees[1].id, employee: "سارة العتيبي", date: "2025-01-16", time: "14:00", duration: 45, status: "confirmed" as const, price: "500" },
    { clientId: clients[9].id, clientName: "سلمى العنزي", clientPhone: "0553210987", serviceId: services[7].id, service: "مكياج عروس", employeeId: employees[3].id, employee: "لمى الشمري", date: "2025-01-17", time: "08:00", duration: 120, status: "pending" as const, price: "1200", notes: "تجهيز كامل للعروس" },
  ];

  const appointments = await db
    .insert(schema.appointments)
    .values(appointmentsData.map((a) => ({ ...a, tenantId })))
    .returning();

  console.log(`✅ ${appointments.length} appointments created`);

  // 8. Create invoices with items
  const invoicesData = [
    {
      invoiceNumber: "INV-00001", date: "2025-11-10", clientId: clients[0].id, clientName: "فاطمة المنصور", clientPhone: "0551234567",
      subtotal: "530", taxRate: "15", taxAmount: "79.50", total: "609.50", status: "paid" as const, paymentMethod: "card" as const, notes: "عميلة VIP",
      items: [
        { description: "مساج سويدي", quantity: 1, unitPrice: "250", discount: "0", total: "250" },
        { description: "تنظيف بشرة عميق", quantity: 1, unitPrice: "280", discount: "0", total: "280" },
      ],
    },
    {
      invoiceNumber: "INV-00002", date: "2025-11-10", clientId: clients[1].id, clientName: "نوف العبدالله", clientPhone: "0559876543",
      subtotal: "315", taxRate: "15", taxAmount: "47.25", total: "362.25", status: "paid" as const, paymentMethod: "cash" as const,
      items: [
        { description: "مساج بالأحجار الساخنة", quantity: 1, unitPrice: "350", discount: "10", total: "315" },
      ],
    },
    {
      invoiceNumber: "INV-00003", date: "2025-11-09", clientId: clients[2].id, clientName: "منال الحربي", clientPhone: "0553456789",
      subtotal: "200", taxRate: "15", taxAmount: "30", total: "230", status: "paid" as const, paymentMethod: "card" as const,
      items: [
        { description: "فيشل كلاسيكي", quantity: 1, unitPrice: "200", discount: "0", total: "200" },
      ],
    },
    {
      invoiceNumber: "INV-00004", date: "2025-11-11", clientId: clients[3].id, clientName: "عبير السبيعي", clientPhone: "0557654321",
      subtotal: "470", taxRate: "0", taxAmount: "0", total: "470", status: "unpaid" as const,
      items: [
        { description: "تنظيف بشرة عميق", quantity: 1, unitPrice: "350", discount: "0", total: "350" },
        { description: "ماسك ترطيب", quantity: 1, unitPrice: "120", discount: "0", total: "120" },
      ],
    },
    {
      invoiceNumber: "INV-00005", date: "2025-11-08", clientId: clients[4].id, clientName: "هيا الغامدي", clientPhone: "0552345678",
      subtotal: "280", taxRate: "15", taxAmount: "42", total: "322", status: "void" as const, paymentMethod: "cash" as const, notes: "تم إلغاء الحجز",
      items: [
        { description: "مساج عميق", quantity: 1, unitPrice: "280", discount: "0", total: "280" },
      ],
    },
  ];

  for (const inv of invoicesData) {
    const { items, ...invoiceData } = inv;
    const [invoice] = await db
      .insert(schema.invoices)
      .values({ ...invoiceData, tenantId })
      .returning();

    await db.insert(schema.invoiceItems).values(
      items.map((item) => ({ ...item, invoiceId: invoice.id }))
    );
  }

  console.log(`✅ ${invoicesData.length} invoices created`);

  // 9. Create expenses
  const expensesData = [
    { date: "2025-01-15", description: "إيجار المركز - يناير", category: "إيجار", amount: "8000", paymentMethod: "تحويل بنكي", status: "approved" as const },
    { date: "2025-01-14", description: "رواتب الموظفات - يناير", category: "رواتب", amount: "10000", paymentMethod: "تحويل بنكي", status: "approved" as const },
    { date: "2025-01-13", description: "مستلزمات تنظيف", category: "مستلزمات", amount: "1200", paymentMethod: "نقدي", status: "approved" as const },
    { date: "2025-01-12", description: "فاتورة كهرباء", category: "مرافق", amount: "2500", paymentMethod: "سداد", status: "approved" as const },
    { date: "2025-01-11", description: "إعلان انستغرام", category: "تسويق", amount: "1500", paymentMethod: "بطاقة ائتمان", status: "pending" as const },
    { date: "2025-01-10", description: "صيانة أجهزة الليزر", category: "صيانة", amount: "3500", paymentMethod: "تحويل بنكي", status: "pending" as const },
    { date: "2025-01-09", description: "منتجات عناية بالبشرة", category: "مستلزمات", amount: "4200", paymentMethod: "بطاقة ائتمان", status: "approved" as const },
    { date: "2025-01-08", description: "فاتورة مياه", category: "مرافق", amount: "800", paymentMethod: "سداد", status: "approved" as const },
    { date: "2025-01-07", description: "تجديد رخصة تجارية", category: "مستلزمات", amount: "2000", paymentMethod: "تحويل بنكي", status: "rejected" as const },
    { date: "2025-01-06", description: "تدريب موظفات", category: "رواتب", amount: "3000", paymentMethod: "تحويل بنكي", status: "pending" as const },
  ];

  const expenseRecords = await db
    .insert(schema.expenses)
    .values(expensesData.map((e) => ({ ...e, tenantId })))
    .returning();

  console.log(`✅ ${expenseRecords.length} expenses created`);

  // 10. Create transactions
  const transactionsData = [
    { date: "2025-01-15", description: "إيرادات خدمات البشرة", category: "العناية بالبشرة", type: "income" as const, amount: "12500" },
    { date: "2025-01-15", description: "إيجار المركز", category: "إيجار", type: "expense" as const, amount: "8000" },
    { date: "2025-01-14", description: "إيرادات جلسات الليزر", category: "الليزر", type: "income" as const, amount: "9800" },
    { date: "2025-01-14", description: "رواتب الموظفات", category: "رواتب", type: "expense" as const, amount: "10000" },
    { date: "2025-01-13", description: "إيرادات خدمات الشعر", category: "العناية بالشعر", type: "income" as const, amount: "7200" },
    { date: "2025-01-13", description: "مستلزمات طبية", category: "مستلزمات", type: "expense" as const, amount: "3200" },
    { date: "2025-01-12", description: "إيرادات المكياج", category: "المكياج", type: "income" as const, amount: "5400" },
    { date: "2025-01-12", description: "فاتورة كهرباء", category: "مرافق", type: "expense" as const, amount: "2500" },
    { date: "2025-01-11", description: "إيرادات الأظافر", category: "الأظافر", type: "income" as const, amount: "4200" },
    { date: "2025-01-11", description: "إعلانات تسويقية", category: "تسويق", type: "expense" as const, amount: "1500" },
  ];

  await db
    .insert(schema.transactions)
    .values(transactionsData.map((t) => ({ ...t, tenantId })));

  console.log(`✅ ${transactionsData.length} transactions created`);

  // 11. Create inventory items
  const inventoryData = [
    { name: "كريم ترطيب للبشرة", sku: "SKN-001", category: "منتجات العناية بالبشرة", quantity: 45, unitPrice: "120", status: "in-stock" as const },
    { name: "سيروم فيتامين سي", sku: "SKN-002", category: "منتجات العناية بالبشرة", quantity: 8, unitPrice: "250", status: "low-stock" as const },
    { name: "شامبو كيراتين", sku: "HAR-001", category: "منتجات الشعر", quantity: 32, unitPrice: "85", status: "in-stock" as const },
    { name: "صبغة شعر - أشقر", sku: "HAR-002", category: "منتجات الشعر", quantity: 0, unitPrice: "65", status: "out-of-stock" as const },
    { name: "قفازات طبية", sku: "CON-001", category: "مستهلكات", quantity: 500, unitPrice: "2", status: "in-stock" as const },
    { name: "جهاز ليزر ديود", sku: "EQP-001", category: "أجهزة", quantity: 2, unitPrice: "15000", status: "in-stock" as const },
    { name: "مقص احترافي", sku: "TLS-001", category: "أدوات", quantity: 5, unitPrice: "350", status: "low-stock" as const },
    { name: "كريم واقي شمس", sku: "SKN-003", category: "منتجات العناية بالبشرة", quantity: 28, unitPrice: "95", status: "in-stock" as const },
    { name: "جل أظافر", sku: "NAL-001", category: "مستهلكات", quantity: 0, unitPrice: "45", status: "out-of-stock" as const },
    { name: "بروتين شعر", sku: "HAR-003", category: "منتجات الشعر", quantity: 4, unitPrice: "180", status: "low-stock" as const },
  ];

  await db
    .insert(schema.inventoryItems)
    .values(inventoryData.map((i) => ({ ...i, tenantId })));

  console.log(`✅ ${inventoryData.length} inventory items created`);

  // 12. Create marketing campaigns
  const campaignsData = [
    { name: "حملة رمضان", channel: "Instagram", status: "completed" as const, startDate: "2025-03-01", endDate: "2025-03-30", budget: "5000", reach: 15200, conversions: 580 },
    { name: "عروض الصيف", channel: "Snapchat", status: "active" as const, startDate: "2025-06-01", endDate: "2025-08-31", budget: "3500", reach: 8900, conversions: 320 },
    { name: "إعلان جوجل - ليزر", channel: "Google Ads", status: "active" as const, startDate: "2025-01-01", endDate: "2025-12-31", budget: "2000", reach: 12400, conversions: 450 },
    { name: "رسائل SMS عملاء", channel: "SMS", status: "active" as const, startDate: "2025-01-01", endDate: "2025-06-30", budget: "800", reach: 3200, conversions: 180 },
    { name: "تيك توك - قبل وبعد", channel: "TikTok", status: "active" as const, startDate: "2025-04-01", endDate: "2025-09-30", budget: "4000", reach: 22000, conversions: 290 },
    { name: "حملة اليوم الوطني", channel: "Instagram", status: "draft" as const, startDate: "2025-09-20", endDate: "2025-09-25", budget: "3000", reach: 0, conversions: 0 },
    { name: "عروض نهاية العام", channel: "Snapchat", status: "paused" as const, startDate: "2025-11-15", endDate: "2025-12-31", budget: "2500", reach: 5600, conversions: 120 },
    { name: "إعلان جوجل - بشرة", channel: "Google Ads", status: "completed" as const, startDate: "2024-06-01", endDate: "2024-12-31", budget: "1800", reach: 9800, conversions: 380 },
  ];

  await db
    .insert(schema.campaigns)
    .values(campaignsData.map((c) => ({ ...c, tenantId })));

  console.log(`✅ ${campaignsData.length} campaigns created`);

  // 13. Create reports
  const reportsData = [
    { type: "financial" as const, name: "تقرير الإيرادات الشهري", description: "ملخص شامل للإيرادات والمصروفات الشهرية مع تحليل الاتجاهات", lastGenerated: new Date("2025-01-15"), downloads: 24, fileSize: "2.4 MB" },
    { type: "appointments" as const, name: "تقرير المواعيد الأسبوعي", description: "تحليل المواعيد المكتملة والملغاة ونسب الحضور", lastGenerated: new Date("2025-01-14"), downloads: 18, fileSize: "1.8 MB" },
    { type: "clients" as const, name: "تقرير العملاء الجدد", description: "إحصائيات العملاء الجدد ومعدلات الاحتفاظ", lastGenerated: new Date("2025-01-13"), downloads: 15, fileSize: "1.2 MB" },
    { type: "employees" as const, name: "تقرير أداء الموظفات", description: "تقييم أداء الموظفات من حيث الإيرادات والمواعيد والتقييمات", lastGenerated: new Date("2025-01-12"), downloads: 12, fileSize: "1.5 MB" },
    { type: "inventory" as const, name: "تقرير حالة المخزون", description: "حالة المخزون الحالية والمنتجات منخفضة المخزون", lastGenerated: new Date("2025-01-11"), downloads: 8, fileSize: "0.9 MB" },
    { type: "marketing" as const, name: "تقرير أداء الحملات", description: "تحليل أداء الحملات التسويقية ومعدلات التحويل", lastGenerated: new Date("2025-01-10"), downloads: 10, fileSize: "2.1 MB" },
    { type: "financial" as const, name: "تقرير الأرباح والخسائر", description: "تقرير شامل للأرباح والخسائر مع مقارنة بالفترات السابقة", lastGenerated: new Date("2025-01-09"), downloads: 20, fileSize: "3.2 MB" },
    { type: "clients" as const, name: "تقرير رضا العملاء", description: "تحليل استبيانات رضا العملاء والتقييمات", lastGenerated: new Date("2025-01-08"), downloads: 14, fileSize: "1.6 MB" },
    { type: "appointments" as const, name: "تقرير الخدمات الأكثر طلباً", description: "ترتيب الخدمات حسب الطلب مع تحليل الإيرادات لكل خدمة", lastGenerated: new Date("2025-01-07"), downloads: 16, fileSize: "1.4 MB" },
  ];

  await db
    .insert(schema.reports)
    .values(reportsData.map((r) => ({ ...r, tenantId })));

  console.log(`✅ ${reportsData.length} reports created`);

  // 14. Create tenant settings
  await db.insert(schema.tenantSettings).values({
    tenantId,
    businessName: "بيوتي سنتر",
    businessNameEn: "Beauty Center",
    taxRate: 15,
    nextInvoiceNumber: 6,
    currency: "SAR",
  });

  console.log("✅ Tenant settings created");

  // 15. Create working hours
  const workingHoursData = [
    { dayOfWeek: 0, startTime: "09:00", endTime: "21:00", isOpen: 1 }, // Sunday
    { dayOfWeek: 1, startTime: "09:00", endTime: "21:00", isOpen: 1 }, // Monday
    { dayOfWeek: 2, startTime: "09:00", endTime: "21:00", isOpen: 1 }, // Tuesday
    { dayOfWeek: 3, startTime: "09:00", endTime: "21:00", isOpen: 1 }, // Wednesday
    { dayOfWeek: 4, startTime: "09:00", endTime: "21:00", isOpen: 1 }, // Thursday
    { dayOfWeek: 5, startTime: "00:00", endTime: "00:00", isOpen: 0 }, // Friday (closed)
    { dayOfWeek: 6, startTime: "10:00", endTime: "22:00", isOpen: 1 }, // Saturday
  ];

  await db
    .insert(schema.workingHours)
    .values(workingHoursData.map((w) => ({ ...w, tenantId })));

  console.log("✅ Working hours created");

  console.log("\n🎉 Seed complete!");
  console.log("📧 Login: admin@beautycenter.com");
  console.log("🔑 Password: admin123");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
