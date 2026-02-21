import { NotificationsCard } from "@/components/settings/notifications-card";
import { NotificationPreferencesCard } from "@/components/notifications/notification-preferences-card";

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <NotificationPreferencesCard />
      <NotificationsCard />
    </div>
  );
}
