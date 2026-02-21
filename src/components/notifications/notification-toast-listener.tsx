"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { useUnreadCount } from "@/lib/hooks";
import { inAppNotificationsApi, type InAppNotification } from "@/lib/api/in-app-notifications";

const PRIORITY_DURATION: Record<string, number | undefined> = {
  critical: undefined, // persist until dismissed
  high: 8000,
  medium: 5000,
  low: 4000,
};

export function NotificationToastListener() {
  const locale = useLocale();
  const router = useRouter();
  const { data: unreadData } = useUnreadCount();
  const lastCountRef = useRef<number | null>(null);
  const lastCheckedAtRef = useRef<string>(new Date().toISOString());
  const toastedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentCount = unreadData?.count ?? 0;

    // On first load, just set the baseline
    if (lastCountRef.current === null) {
      lastCountRef.current = currentCount;
      return;
    }

    // If count increased, fetch new notifications and show toasts
    if (currentCount > lastCountRef.current) {
      fetchAndShowToasts();
    }

    lastCountRef.current = currentCount;
  }, [unreadData?.count]);

  async function fetchAndShowToasts() {
    try {
      const result = await inAppNotificationsApi.list({ limit: 5, unreadOnly: true });
      const newNotifications = result.data.filter(
        (n) =>
          !toastedIdsRef.current.has(n.id) &&
          new Date(n.createdAt) > new Date(lastCheckedAtRef.current)
      );

      for (const n of newNotifications) {
        toastedIdsRef.current.add(n.id);
        showToast(n);
      }

      // Cap the set to prevent unbounded growth
      if (toastedIdsRef.current.size > 50) {
        const entries = Array.from(toastedIdsRef.current);
        toastedIdsRef.current = new Set(entries.slice(-50));
      }

      lastCheckedAtRef.current = new Date().toISOString();
    } catch (error) {
      console.error("Failed to fetch notifications for toast:", error);
    }
  }

  function showToast(n: InAppNotification) {
    const title = locale === "ar" ? n.title : (n.titleEn || n.title);
    const body = locale === "ar" ? n.body : (n.bodyEn || n.body);
    const duration = PRIORITY_DURATION[n.priority] ?? 5000;

    const toastOptions = {
      description: body || undefined,
      duration,
      action: n.actionUrl
        ? {
            label: locale === "ar" ? "عرض" : "View",
            onClick: () => router.push(n.actionUrl!),
          }
        : undefined,
    };

    if (n.priority === "critical") {
      toast.error(title, toastOptions);
    } else if (n.priority === "high") {
      toast.warning(title, toastOptions);
    } else {
      toast(title, toastOptions);
    }
  }

  return null;
}
