export interface SettingsNavItem {
  id: string;
  labelKey: string;
  descKey: string;
  icon: string;
  route: string;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: "profile",
    labelKey: "settings.nav.profile",
    descKey: "settings.nav.profileDesc",
    icon: "User",
    route: "/settings/profile",
  },
  {
    id: "general",
    labelKey: "settings.nav.general",
    descKey: "settings.nav.generalDesc",
    icon: "Settings",
    route: "/settings/general",
  },
  {
    id: "financial",
    labelKey: "settings.nav.financial",
    descKey: "settings.nav.financialDesc",
    icon: "DollarSign",
    route: "/settings/financial",
  },
  {
    id: "schedule",
    labelKey: "settings.nav.schedule",
    descKey: "settings.nav.scheduleDesc",
    icon: "Clock",
    route: "/settings/schedule",
  },
  {
    id: "sections",
    labelKey: "settings.nav.sections",
    descKey: "settings.nav.sectionsDesc",
    icon: "LayoutGrid",
    route: "/settings/sections",
  },
  {
    id: "notifications",
    labelKey: "settings.nav.notifications",
    descKey: "settings.nav.notificationsDesc",
    icon: "Bell",
    route: "/settings/notifications",
  },
  {
    id: "team",
    labelKey: "settings.nav.team",
    descKey: "settings.nav.teamDesc",
    icon: "Shield",
    route: "/settings/team",
  },
  {
    id: "appearance",
    labelKey: "settings.nav.appearance",
    descKey: "settings.nav.appearanceDesc",
    icon: "Palette",
    route: "/settings/appearance",
  },
];
