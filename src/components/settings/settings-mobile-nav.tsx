"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV_ITEMS } from "@/constants/settings-nav";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export function SettingsMobileNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="md:hidden overflow-x-auto border-b border-border bg-background">
      <div className="flex gap-2 p-3">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <DynamicIcon
                name={item.icon}
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive ? "text-gold" : ""
                )}
              />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
