"use client";

import { useTranslations } from "next-intl";
import { GeneralSettingsCard } from "./general-settings-card";
import { BusinessInfoCard } from "./business-info-card";
import { WorkingHoursCard } from "./working-hours-card";
import { NotificationsCard } from "./notifications-card";
import { UsersPermissionsCard } from "./users-permissions-card";
import { AppearanceCard } from "./appearance-card";
import { SectionsSettingsCard } from "./sections-settings-card";
import { CurrencyTaxCard } from "./currency-tax-card";
import { ExchangeRatesCard } from "./exchange-rates-card";

export function SettingsPageContent() {
  const t = useTranslations("settings");

  return (
    <div className="space-y-6">
      <GeneralSettingsCard />
      <CurrencyTaxCard />
      <ExchangeRatesCard />
      <BusinessInfoCard />
      <SectionsSettingsCard />
      <WorkingHoursCard />
      <NotificationsCard />
      <UsersPermissionsCard />
      <AppearanceCard />
    </div>
  );
}
