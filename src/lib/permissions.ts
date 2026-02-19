export type Role = "owner" | "admin" | "manager" | "staff" | "receptionist";

export type Permission =
  | "clients:read"
  | "clients:write"
  | "clients:delete"
  | "appointments:read"
  | "appointments:write"
  | "appointments:delete"
  | "services:read"
  | "services:write"
  | "services:delete"
  | "employees:read"
  | "employees:write"
  | "employees:delete"
  | "doctors:read"
  | "doctors:write"
  | "doctors:delete"
  | "inventory:read"
  | "inventory:write"
  | "inventory:delete"
  | "invoices:read"
  | "invoices:write"
  | "invoices:delete"
  | "invoices:edit_completed"
  | "expenses:read"
  | "expenses:write"
  | "expenses:delete"
  | "finance:read"
  | "finance:write"
  | "reports:read"
  | "reports:export"
  | "marketing:read"
  | "marketing:write"
  | "marketing:delete"
  | "settings:read"
  | "settings:write"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "sections:read"
  | "sections:write"
  | "sections:delete"
  | "roles:read"
  | "roles:write"
  | "roles:delete"
  | "admin:access";

// --- Permission metadata for UI ---

export type PermissionCategory =
  | "clients"
  | "appointments"
  | "services"
  | "employees"
  | "doctors"
  | "inventory"
  | "invoices"
  | "expenses"
  | "finance"
  | "reports"
  | "marketing"
  | "sections"
  | "settings"
  | "users"
  | "roles"
  | "admin";

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "clients",
  "appointments",
  "services",
  "employees",
  "doctors",
  "inventory",
  "invoices",
  "expenses",
  "finance",
  "reports",
  "marketing",
  "sections",
  "settings",
  "users",
  "roles",
  "admin",
];

export interface PermissionMeta {
  key: Permission;
  category: PermissionCategory;
  labelKey: string;
}

export const ALL_PERMISSIONS: PermissionMeta[] = [
  { key: "clients:read", category: "clients", labelKey: "permissions.clients.read" },
  { key: "clients:write", category: "clients", labelKey: "permissions.clients.write" },
  { key: "clients:delete", category: "clients", labelKey: "permissions.clients.delete" },
  { key: "appointments:read", category: "appointments", labelKey: "permissions.appointments.read" },
  { key: "appointments:write", category: "appointments", labelKey: "permissions.appointments.write" },
  { key: "appointments:delete", category: "appointments", labelKey: "permissions.appointments.delete" },
  { key: "services:read", category: "services", labelKey: "permissions.services.read" },
  { key: "services:write", category: "services", labelKey: "permissions.services.write" },
  { key: "services:delete", category: "services", labelKey: "permissions.services.delete" },
  { key: "employees:read", category: "employees", labelKey: "permissions.employees.read" },
  { key: "employees:write", category: "employees", labelKey: "permissions.employees.write" },
  { key: "employees:delete", category: "employees", labelKey: "permissions.employees.delete" },
  { key: "doctors:read", category: "doctors", labelKey: "permissions.doctors.read" },
  { key: "doctors:write", category: "doctors", labelKey: "permissions.doctors.write" },
  { key: "doctors:delete", category: "doctors", labelKey: "permissions.doctors.delete" },
  { key: "inventory:read", category: "inventory", labelKey: "permissions.inventory.read" },
  { key: "inventory:write", category: "inventory", labelKey: "permissions.inventory.write" },
  { key: "inventory:delete", category: "inventory", labelKey: "permissions.inventory.delete" },
  { key: "invoices:read", category: "invoices", labelKey: "permissions.invoices.read" },
  { key: "invoices:write", category: "invoices", labelKey: "permissions.invoices.write" },
  { key: "invoices:delete", category: "invoices", labelKey: "permissions.invoices.delete" },
  { key: "invoices:edit_completed", category: "invoices", labelKey: "permissions.invoices.editCompleted" },
  { key: "expenses:read", category: "expenses", labelKey: "permissions.expenses.read" },
  { key: "expenses:write", category: "expenses", labelKey: "permissions.expenses.write" },
  { key: "expenses:delete", category: "expenses", labelKey: "permissions.expenses.delete" },
  { key: "finance:read", category: "finance", labelKey: "permissions.finance.read" },
  { key: "finance:write", category: "finance", labelKey: "permissions.finance.write" },
  { key: "reports:read", category: "reports", labelKey: "permissions.reports.read" },
  { key: "reports:export", category: "reports", labelKey: "permissions.reports.export" },
  { key: "marketing:read", category: "marketing", labelKey: "permissions.marketing.read" },
  { key: "marketing:write", category: "marketing", labelKey: "permissions.marketing.write" },
  { key: "marketing:delete", category: "marketing", labelKey: "permissions.marketing.delete" },
  { key: "sections:read", category: "sections", labelKey: "permissions.sections.read" },
  { key: "sections:write", category: "sections", labelKey: "permissions.sections.write" },
  { key: "sections:delete", category: "sections", labelKey: "permissions.sections.delete" },
  { key: "settings:read", category: "settings", labelKey: "permissions.settings.read" },
  { key: "settings:write", category: "settings", labelKey: "permissions.settings.write" },
  { key: "users:read", category: "users", labelKey: "permissions.users.read" },
  { key: "users:write", category: "users", labelKey: "permissions.users.write" },
  { key: "users:delete", category: "users", labelKey: "permissions.users.delete" },
  { key: "roles:read", category: "roles", labelKey: "permissions.roles.read" },
  { key: "roles:write", category: "roles", labelKey: "permissions.roles.write" },
  { key: "roles:delete", category: "roles", labelKey: "permissions.roles.delete" },
  { key: "admin:access", category: "admin", labelKey: "permissions.admin.access" },
];

// --- Permission resolver for per-user overrides ---

export function resolvePermissions(
  rolePermissions: Permission[],
  customPermissions?: { granted: Permission[]; revoked: Permission[] } | null
): Permission[] {
  if (!customPermissions) return rolePermissions;
  const set = new Set(rolePermissions);
  for (const p of customPermissions.revoked) set.delete(p);
  for (const p of customPermissions.granted) set.add(p);
  return Array.from(set);
}

// --- Predefined role templates (used for seeding) ---

const ALL_PERMS: Permission[] = ALL_PERMISSIONS.map((p) => p.key);

export const PREDEFINED_ROLES = [
  {
    slug: "owner",
    name: "المالك",
    nameEn: "Owner",
    permissions: ALL_PERMS,
  },
  {
    slug: "admin",
    name: "المدير",
    nameEn: "Admin",
    permissions: ALL_PERMS.filter((p) => p !== "admin:access"),
  },
  {
    slug: "manager",
    name: "المشرف",
    nameEn: "Manager",
    permissions: [
      "clients:read", "clients:write", "clients:delete",
      "appointments:read", "appointments:write", "appointments:delete",
      "services:read", "services:write", "services:delete",
      "employees:read", "employees:write",
      "doctors:read", "doctors:write",
      "inventory:read", "inventory:write", "inventory:delete",
      "invoices:read", "invoices:write", "invoices:delete",
      "expenses:read", "expenses:write", "expenses:delete",
      "finance:read", "finance:write",
      "reports:read", "reports:export",
      "marketing:read", "marketing:write", "marketing:delete",
      "sections:read", "sections:write",
      "settings:read",
      "users:read",
      "roles:read",
    ] as Permission[],
  },
  {
    slug: "receptionist",
    name: "موظف الاستقبال",
    nameEn: "Receptionist",
    permissions: [
      "clients:read", "clients:write",
      "appointments:read", "appointments:write",
      "services:read",
      "invoices:read", "invoices:write",
      "sections:read",
    ] as Permission[],
  },
  {
    slug: "staff",
    name: "موظف",
    nameEn: "Staff",
    permissions: [
      "clients:read", "clients:write",
      "appointments:read", "appointments:write",
      "services:read",
      "employees:read",
      "doctors:read",
      "inventory:read",
      "invoices:read",
      "marketing:read",
      "sections:read",
      "settings:read",
    ] as Permission[],
  },
  {
    slug: "accountant",
    name: "محاسب",
    nameEn: "Accountant",
    permissions: [
      "invoices:read", "invoices:write", "invoices:edit_completed",
      "expenses:read", "expenses:write",
      "finance:read", "finance:write",
      "reports:read", "reports:export",
    ] as Permission[],
  },
];

// --- Backward-compatible static role permissions (Phase 2 will deprecate) ---

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL_PERMS,
  admin: ALL_PERMS.filter((p) => p !== "admin:access"),
  manager: [
    "clients:read", "clients:write", "clients:delete",
    "appointments:read", "appointments:write", "appointments:delete",
    "services:read", "services:write", "services:delete",
    "employees:read", "employees:write",
    "doctors:read", "doctors:write",
    "inventory:read", "inventory:write", "inventory:delete",
    "invoices:read", "invoices:write", "invoices:delete",
    "expenses:read", "expenses:write", "expenses:delete",
    "finance:read", "finance:write",
    "reports:read", "reports:export",
    "marketing:read", "marketing:write", "marketing:delete",
    "sections:read", "sections:write",
    "settings:read",
    "users:read",
    "roles:read",
  ],
  staff: [
    "clients:read", "clients:write",
    "appointments:read", "appointments:write",
    "services:read",
    "employees:read",
    "doctors:read",
    "inventory:read",
    "invoices:read",
    "marketing:read",
    "sections:read",
    "settings:read",
  ],
  receptionist: [
    "clients:read", "clients:write",
    "appointments:read", "appointments:write",
    "services:read",
    "invoices:read", "invoices:write",
    "sections:read",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
