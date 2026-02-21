"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import {
  useInAppNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "@/lib/hooks";

const CATEGORIES = ["all", "appointment", "inventory", "financial", "system"] as const;

export function HeaderNotifications() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const category = activeTab === "all" ? undefined : activeTab;
  const { data: notificationsData, isLoading } = useInAppNotifications({
    category,
    limit: 10,
  });

  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = notificationsData?.data ?? [];

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(category);
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push("/notifications");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="font-semibold text-foreground">{t("title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5 me-1" />
              {t("markAllRead")}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="text-xs flex-1">
              {t("all")}
            </TabsTrigger>
            <TabsTrigger value="appointment" className="text-xs flex-1">
              {t("categoryAppointment")}
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs flex-1">
              {t("categoryInventory")}
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs flex-1">
              {t("categoryFinancial")}
            </TabsTrigger>
          </TabsList>

          {CATEGORIES.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                        <div className="h-9 w-9 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-muted rounded w-3/4" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("noNotifications")}
                    </p>
                  </div>
                ) : (
                  <div className="p-1">
                    {notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onMarkRead={handleMarkRead}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {notifications.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={handleViewAll}
            >
              {t("viewAll")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
