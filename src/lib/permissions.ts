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
  | "admin:access";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "clients:read",
    "clients:write",
    "clients:delete",
    "appointments:read",
    "appointments:write",
    "appointments:delete",
    "services:read",
    "services:write",
    "services:delete",
    "employees:read",
    "employees:write",
    "employees:delete",
    "doctors:read",
    "doctors:write",
    "doctors:delete",
    "inventory:read",
    "inventory:write",
    "inventory:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "expenses:read",
    "expenses:write",
    "expenses:delete",
    "finance:read",
    "finance:write",
    "reports:read",
    "reports:export",
    "marketing:read",
    "marketing:write",
    "marketing:delete",
    "settings:read",
    "settings:write",
    "users:read",
    "users:write",
    "users:delete",
    "admin:access",
  ],
  admin: [
    "clients:read",
    "clients:write",
    "clients:delete",
    "appointments:read",
    "appointments:write",
    "appointments:delete",
    "services:read",
    "services:write",
    "services:delete",
    "employees:read",
    "employees:write",
    "employees:delete",
    "doctors:read",
    "doctors:write",
    "doctors:delete",
    "inventory:read",
    "inventory:write",
    "inventory:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "expenses:read",
    "expenses:write",
    "expenses:delete",
    "finance:read",
    "finance:write",
    "reports:read",
    "reports:export",
    "marketing:read",
    "marketing:write",
    "marketing:delete",
    "settings:read",
    "settings:write",
    "users:read",
    "users:write",
  ],
  manager: [
    "clients:read",
    "clients:write",
    "clients:delete",
    "appointments:read",
    "appointments:write",
    "appointments:delete",
    "services:read",
    "services:write",
    "services:delete",
    "employees:read",
    "employees:write",
    "doctors:read",
    "doctors:write",
    "inventory:read",
    "inventory:write",
    "inventory:delete",
    "invoices:read",
    "invoices:write",
    "invoices:delete",
    "expenses:read",
    "expenses:write",
    "expenses:delete",
    "finance:read",
    "finance:write",
    "reports:read",
    "reports:export",
    "marketing:read",
    "marketing:write",
    "marketing:delete",
    "settings:read",
    "users:read",
  ],
  staff: [
    "clients:read",
    "clients:write",
    "appointments:read",
    "appointments:write",
    "services:read",
    "employees:read",
    "doctors:read",
    "inventory:read",
    "invoices:read",
    "marketing:read",
    "settings:read",
  ],
  receptionist: [
    "clients:read",
    "clients:write",
    "appointments:read",
    "appointments:write",
    "services:read",
    "invoices:read",
    "invoices:write",
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
