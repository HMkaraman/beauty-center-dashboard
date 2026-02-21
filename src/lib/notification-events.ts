import { dispatchNotification, type NotificationCategory, type NotificationPriority } from "./notification-dispatcher";

interface NotificationEventConfig {
  category: NotificationCategory;
  priority: NotificationPriority;
  icon: string;
  titleAr: string;
  titleEn: string;
  bodyTemplateAr?: string;
  bodyTemplateEn?: string;
  targetRoles: string[];
  targetAssigned?: boolean;
  actionUrlTemplate?: string;
}

const NOTIFICATION_EVENTS: Record<string, NotificationEventConfig> = {
  appointment_created: {
    category: "appointment",
    priority: "high",
    icon: "CalendarPlus",
    titleAr: "موعد جديد",
    titleEn: "New Appointment",
    bodyTemplateAr: "{{clientName}} - {{service}} في {{date}} الساعة {{time}}",
    bodyTemplateEn: "{{clientName}} - {{service}} on {{date}} at {{time}}",
    targetRoles: ["owner", "admin", "manager", "receptionist"],
    targetAssigned: true,
    actionUrlTemplate: "/appointments/{{entityId}}",
  },
  appointment_status_changed: {
    category: "appointment",
    priority: "medium",
    icon: "CalendarClock",
    titleAr: "تم تغيير حالة الموعد",
    titleEn: "Appointment Status Changed",
    bodyTemplateAr: "{{clientName}} - {{service}}: {{status}}",
    bodyTemplateEn: "{{clientName}} - {{service}}: {{status}}",
    targetRoles: ["owner", "admin", "manager", "receptionist"],
    targetAssigned: true,
    actionUrlTemplate: "/appointments/{{entityId}}",
  },
  appointment_deleted: {
    category: "appointment",
    priority: "medium",
    icon: "CalendarX2",
    titleAr: "تم حذف موعد",
    titleEn: "Appointment Deleted",
    bodyTemplateAr: "{{clientName}} - {{service}} في {{date}}",
    bodyTemplateEn: "{{clientName}} - {{service}} on {{date}}",
    targetRoles: ["owner", "admin", "manager", "receptionist"],
  },
  inventory_low_stock: {
    category: "inventory",
    priority: "high",
    icon: "PackageX",
    titleAr: "تنبيه نقص المخزون",
    titleEn: "Low Stock Alert",
    bodyTemplateAr: "{{itemName}} - الكمية: {{quantity}} (الحد الأدنى: {{reorderLevel}})",
    bodyTemplateEn: "{{itemName}} - Quantity: {{quantity}} (Reorder level: {{reorderLevel}})",
    targetRoles: ["owner", "admin", "manager"],
    actionUrlTemplate: "/inventory/{{entityId}}/edit",
  },
  invoice_created: {
    category: "financial",
    priority: "medium",
    icon: "Receipt",
    titleAr: "فاتورة جديدة",
    titleEn: "New Invoice",
    bodyTemplateAr: "{{invoiceNumber}} - {{clientName}} - {{total}}",
    bodyTemplateEn: "{{invoiceNumber}} - {{clientName}} - {{total}}",
    targetRoles: ["owner", "admin", "manager"],
    actionUrlTemplate: "/finance",
  },
  client_created: {
    category: "client",
    priority: "low",
    icon: "UserPlus",
    titleAr: "عميل جديد",
    titleEn: "New Client",
    bodyTemplateAr: "{{clientName}}",
    bodyTemplateEn: "{{clientName}}",
    targetRoles: ["owner", "admin", "manager", "receptionist"],
    actionUrlTemplate: "/clients/{{entityId}}",
  },
  employee_schedule_changed: {
    category: "staff",
    priority: "medium",
    icon: "Clock",
    titleAr: "تم تغيير الجدول",
    titleEn: "Schedule Changed",
    bodyTemplateAr: "تم تحديث جدول {{employeeName}}",
    bodyTemplateEn: "{{employeeName}}'s schedule has been updated",
    targetRoles: ["owner", "admin", "manager"],
    targetAssigned: true,
  },
};

function renderTemplate(template: string | undefined, context: Record<string, string>): string | undefined {
  if (!template) return undefined;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] || "");
}

interface TriggerNotificationParams {
  eventKey: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  entityType?: string;
  entityId?: string;
  context: Record<string, string>;
  targetUserIds?: string[];
}

export function triggerNotification(params: TriggerNotificationParams): void {
  const config = NOTIFICATION_EVENTS[params.eventKey];
  if (!config) {
    console.error(`Unknown notification event: ${params.eventKey}`);
    return;
  }

  const templateContext = { ...params.context, entityId: params.entityId || "" };
  const body = renderTemplate(config.bodyTemplateAr, templateContext);
  const bodyEn = renderTemplate(config.bodyTemplateEn, templateContext);
  const actionUrl = config.actionUrlTemplate
    ? renderTemplate(config.actionUrlTemplate, templateContext)
    : undefined;

  // Fire-and-forget
  dispatchNotification({
    tenantId: params.tenantId,
    category: config.category,
    priority: config.priority,
    title: config.titleAr,
    titleEn: config.titleEn,
    body,
    bodyEn,
    icon: config.icon,
    actionUrl,
    entityType: params.entityType,
    entityId: params.entityId,
    actorId: params.actorId,
    actorName: params.actorName,
    metadata: params.context as unknown as Record<string, unknown>,
    targetRoles: config.targetRoles,
    targetUserIds: params.targetUserIds,
  });
}
