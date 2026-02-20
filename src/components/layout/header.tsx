"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_ITEMS } from "@/constants/navigation";
import { HeaderDateFilter } from "./header-date-filter";
import { HeaderSearch } from "./header-search";
import { HeaderNotifications } from "./header-notifications";
import { HeaderUserMenu } from "./header-user-menu";

const FILTERABLE_ROUTES = ["/", "/finance", "/reports"];

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const matchedNav = NAV_ITEMS.find((item) =>
    item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
  );
  const pageTitle = title || (matchedNav ? t(matchedNav.labelKey) : t("dashboard.title"));

  const showDateFilter = FILTERABLE_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Page title */}
        <h1 className="text-lg font-bold text-foreground md:text-xl">
          {pageTitle}
        </h1>

        {/* Date filter pills — only on relevant pages, hidden on mobile */}
        {showDateFilter && <HeaderDateFilter />}

        {/* Right section */}
        <div className="flex items-center gap-2">
          <HeaderSearch />
          <HeaderNotifications />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
