"use client";

import { useTranslations } from "next-intl";
import { GeneralSettingsCard } from "./general-settings-card";
import { BusinessInfoCard } from "./business-info-card";
import { WorkingHoursCard } from "./working-hours-card";
import { NotificationsCard } from "./notifications-card";
import { UsersPermissionsCard } from "./users-permissions-card";
import { AppearanceCard } from "./appearance-card";

export function SettingsPageContent() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-6">
      <GeneralSettingsCard />
      <BusinessInfoCard />
      <WorkingHoursCard />
      <NotificationsCard />
      <UsersPermissionsCard />
      <AppearanceCard />
    </div>
  );
}
