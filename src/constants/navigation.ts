import { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: "LayoutDashboard", route: "/" },
  { id: "appointments", labelKey: "nav.appointments", icon: "CalendarDays", route: "/appointments" },
  { id: "clients", labelKey: "nav.clients", icon: "Users", route: "/clients" },
  { id: "employees", labelKey: "nav.employees", icon: "UserCog", route: "/employees" },
  { id: "doctors", labelKey: "nav.doctors", icon: "Stethoscope", route: "/doctors" },
  { id: "services", labelKey: "nav.services", icon: "Sparkles", route: "/services" },
  { id: "finance", labelKey: "nav.finance", icon: "Wallet", route: "/finance" },
  { id: "inventory", labelKey: "nav.inventory", icon: "Package", route: "/inventory" },
  { id: "reports", labelKey: "nav.reports", icon: "BarChart3", route: "/reports" },
  { id: "marketing", labelKey: "nav.marketing", icon: "Megaphone", route: "/marketing" },
  { id: "reception", labelKey: "nav.reception", icon: "MonitorSmartphone", route: "/reception" },
  { id: "settings", labelKey: "nav.settings", icon: "Settings", route: "/settings" },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) =>
  ["dashboard", "appointments", "clients", "finance"].includes(item.id)
);
