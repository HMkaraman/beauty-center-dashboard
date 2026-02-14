"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_ITEMS, NAV_ITEMS } from "@/constants/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations();

  const remainingItems = NAV_ITEMS.filter(
    (item) => !MOBILE_NAV_ITEMS.find((m) => m.id === item.id)
  );

  return (
    <div className="fixed bottom-0 start-0 end-0 z-50 border-t border-border bg-sidebar md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);

          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                isActive ? "text-gold" : "text-sidebar-foreground"
              )}
            >
              <DynamicIcon name={item.icon} className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        {/* More button */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-sidebar-foreground">
              <MoreHorizontal className="h-5 w-5" />
              <span>{t("common.more")}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-sidebar border-border">
            <SheetHeader>
              <SheetTitle className="text-foreground">{t("common.menu")}</SheetTitle>
            </SheetHeader>
            <nav className="grid grid-cols-3 gap-4 py-4">
              {remainingItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.route}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 text-sm text-sidebar-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <DynamicIcon name={item.icon} className="h-5 w-5" />
                  <span className="text-xs">{t(item.labelKey)}</span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
