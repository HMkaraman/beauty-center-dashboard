"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV_ITEMS } from "@/constants/settings-nav";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export function SettingsSidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-e border-border bg-sidebar">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {t("settings.title")}
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.route);
            return (
              <li key={item.id}>
                <Link
                  href={item.route}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-gold/10 text-gold border-s-2 border-gold"
                      : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <DynamicIcon
                    name={item.icon}
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-gold" : ""
                    )}
                  />
                  <div className="min-w-0">
                    <div className="truncate">{t(item.labelKey)}</div>
                    <div
                      className={cn(
                        "truncate text-xs",
                        isActive
                          ? "text-gold/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {t(item.descKey)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
