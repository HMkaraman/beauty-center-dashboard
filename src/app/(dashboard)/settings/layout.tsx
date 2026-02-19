import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SettingsMobileNav } from "@/components/settings/settings-mobile-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 md:-m-6 flex min-h-[calc(100vh-4rem)]">
      <SettingsSidebar />
      <div className="flex-1 min-w-0">
        <SettingsMobileNav />
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
