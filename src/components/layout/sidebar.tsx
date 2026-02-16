"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Globe, LogOut, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { useSidebarStore } from "@/store/useSidebarStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();
  const { isCollapsed, setCollapsed } = useSidebarStore();

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    window.location.reload();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setCollapsed(false);
      } else if (width >= 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed top-0 start-0 z-40 hidden h-screen flex-col border-e border-border bg-sidebar md:flex"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/15">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base font-bold text-foreground"
            >
              {t("common.beautyCenter")}
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);

              const linkContent = (
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
                    className={cn("h-5 w-5 shrink-0", isActive ? "text-gold" : "")}
                  />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {t(item.labelKey)}
                    </motion.span>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {t(item.labelKey)}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              return <li key={item.id}>{linkContent}</li>;
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3 space-y-1">
          <button
            onClick={toggleLocale}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Globe className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{locale === "ar" ? t("common.english") : t("common.arabic")}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-red/10 hover:text-red transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{t("common.logout")}</span>}
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
