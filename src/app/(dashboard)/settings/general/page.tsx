import { GeneralSettingsCard } from "@/components/settings/general-settings-card";
import { BusinessInfoCard } from "@/components/settings/business-info-card";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <GeneralSettingsCard />
      <BusinessInfoCard />
    </div>
  );
}
