import { RolesCard } from "@/components/settings/roles-card";
import { UsersPermissionsCard } from "@/components/settings/users-permissions-card";

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <RolesCard />
      <UsersPermissionsCard />
    </div>
  );
}
