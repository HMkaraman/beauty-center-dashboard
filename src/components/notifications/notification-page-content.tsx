"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck, Archive } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./notification-item";
import {
  useInAppNotifications,
  useMarkRead,
  useMarkAllRead,
  useArchiveNotification,
  useArchiveAll,
  useUnreadCountsByCategory,
} from "@/lib/hooks";

const CATEGORIES = ["all", "appointment", "inventory", "financial", "staff", "client", "system", "marketing"] as const;

export function NotificationPageContent() {
  const t = useTranslations("notifications");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);

  const category = activeTab === "all" ? undefined : activeTab;
  const { data, isLoading } = useInAppNotifications({ category, page, limit: 20, archived: showArchived });

  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const archiveNotification = useArchiveNotification();
  const archiveAll = useArchiveAll();
  const { data: unreadCounts } = useUnreadCountsByCategory();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(category);
  };

  const handleArchive = (id: string) => {
    archiveNotification.mutate(id);
  };

  const handleArchiveAll = () => {
    archiveAll.mutate();
  };

  const getUnreadBadge = (cat: string) => {
    if (!unreadCounts) return 0;
    if (cat === "all") return Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);
    return unreadCounts[cat] ?? 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => { setShowArchived(!showArchived); setPage(1); }}
          >
            <Archive className="h-4 w-4 me-2" />
            {t("archived")}
          </Button>
          {!showArchived && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveAll}
                disabled={archiveAll.isPending}
              >
                <Archive className="h-4 w-4 me-2" />
                {t("archiveAll")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-4 w-4 me-2" />
                {t("markAllRead")}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList className="flex-wrap">
          {CATEGORIES.map((cat) => {
            const label = cat === "all" ? t("all") : t(`category${cat.charAt(0).toUpperCase()}${cat.slice(1)}` as Parameters<typeof t>[0]);
            const count = getUnreadBadge(cat);
            return (
              <TabsTrigger key={cat} value={cat} className="relative">
                {label}
                {count > 0 && !showArchived && (
                  <span className="ms-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
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
                    {showArchived ? t("noArchivedNotifications") : t("noNotifications")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkRead}
                      onArchive={!showArchived ? handleArchive : undefined}
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
