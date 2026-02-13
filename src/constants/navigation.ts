import { NavItem } from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: "LayoutDashboard", route: "/", isMVP: true },
  { id: "appointments", labelKey: "nav.appointments", icon: "CalendarDays", route: "/appointments", isMVP: false },
  { id: "clients", labelKey: "nav.clients", icon: "Users", route: "/clients", isMVP: false },
  { id: "employees", labelKey: "nav.employees", icon: "UserCog", route: "/employees", isMVP: false },
  { id: "doctors", labelKey: "nav.doctors", icon: "Stethoscope", route: "/doctors", isMVP: false },
  { id: "services", labelKey: "nav.services", icon: "Sparkles", route: "/services", isMVP: false },
  { id: "finance", labelKey: "nav.finance", icon: "Wallet", route: "/finance", isMVP: false },
  { id: "expenses", labelKey: "nav.expenses", icon: "Receipt", route: "/expenses", isMVP: false },
  { id: "inventory", labelKey: "nav.inventory", icon: "Package", route: "/inventory", isMVP: false },
  { id: "reports", labelKey: "nav.reports", icon: "BarChart3", route: "/reports", isMVP: false },
  { id: "marketing", labelKey: "nav.marketing", icon: "Megaphone", route: "/marketing", isMVP: false },
  { id: "settings", labelKey: "nav.settings", icon: "Settings", route: "/settings", isMVP: false },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) =>
  ["dashboard", "appointments", "clients", "finance"].includes(item.id)
);
