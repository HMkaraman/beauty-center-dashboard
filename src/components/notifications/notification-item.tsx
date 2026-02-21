"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  CalendarClock,
  CalendarX2,
  PackageX,
  Receipt,
  UserPlus,
  Clock,
  Bell,
  Check,
  AlarmClock,
  AlertTriangle,
  Archive,
} from "lucide-react";
import type { InAppNotification } from "@/lib/api/in-app-notifications";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarPlus,
  CalendarClock,
  CalendarX2,
  PackageX,
  Receipt,
  UserPlus,
  Clock,
  AlarmClock,
  AlertTriangle,
};

const CATEGORY_COLORS: Record<string, string> = {
  appointment: "text-blue-500 bg-blue-500/10",
  inventory: "text-amber-500 bg-amber-500/10",
  financial: "text-green-500 bg-green-500/10",
  staff: "text-purple-500 bg-purple-500/10",
  client: "text-pink-500 bg-pink-500/10",
  system: "text-gray-500 bg-gray-500/10",
  marketing: "text-orange-500 bg-orange-500/10",
};

function getRelativeTime(dateStr: string, locale: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (locale === "ar") {
    if (diffMin < 1) return "الآن";
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    return `منذ ${diffDay} يوم`;
  }

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

interface NotificationItemProps {
  notification: InAppNotification;
  onMarkRead?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onArchive }: NotificationItemProps) {
  const locale = useLocale();
  const router = useRouter();
  const isUnread = notification.isRead === 0;

  const IconComponent = (notification.icon && ICON_MAP[notification.icon]) || Bell;
  const colorClass = CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.system;

  const title = locale === "ar" ? notification.title : (notification.titleEn || notification.title);
  const body = locale === "ar" ? notification.body : (notification.bodyEn || notification.body);
  const timeAgo = getRelativeTime(notification.createdAt, locale);

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group w-full text-start flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 ${
        isUnread ? "bg-primary/5" : ""
      }`}
    >
      <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${colorClass}`}>
        <IconComponent className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${isUnread ? "font-semibold text-foreground" : "text-foreground"}`}>
            {title}
          </p>
          {isUnread && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>
        {body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {notification.actorName && (
            <span className="text-xs text-muted-foreground/70">{notification.actorName}</span>
          )}
          {notification.actorName && (
            <span className="text-xs text-muted-foreground/40">·</span>
          )}
          <span className="text-xs text-muted-foreground/70">{timeAgo}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && onMarkRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="p-1 rounded hover:bg-muted"
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        {onArchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(notification.id);
            }}
            className="p-1 rounded hover:bg-muted"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </button>
  );
}
