"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./notification-item";
import {
  useInAppNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/lib/hooks";

const CATEGORIES = ["all", "appointment", "inventory", "financial", "staff", "client", "system", "marketing"] as const;

export function NotificationPageContent() {
  const t = useTranslations("notifications");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const category = activeTab === "all" ? undefined : activeTab;
  const { data, isLoading } = useInAppNotifications({ category, page, limit: 20 });

  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={markAllRead.isPending}
        >
          <CheckCheck className="h-4 w-4 me-2" />
          {t("markAllRead")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          <TabsTrigger value="appointment">{t("categoryAppointment")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("categoryInventory")}</TabsTrigger>
          <TabsTrigger value="financial">{t("categoryFinancial")}</TabsTrigger>
          <TabsTrigger value="staff">{t("categoryStaff")}</TabsTrigger>
          <TabsTrigger value="client">{t("categoryClient")}</TabsTrigger>
          <TabsTrigger value="system">{t("categorySystem")}</TabsTrigger>
          <TabsTrigger value="marketing">{t("categoryMarketing")}</TabsTrigger>
        </TabsList>

        {CATEGORIES.map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-lg border border-border bg-card">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                      <div className="h-9 w-9 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                        <div className="h-2 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("noNotifications")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t("previous") || "Previous"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("next") || "Next"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
