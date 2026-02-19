"use client";

import { useTranslations, useLocale } from "next-intl";
import { Plus, Pencil, Trash2, MessageSquare, Play, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TimelineEntryChanges } from "./timeline-entry-changes";
import type { ActivityLog, ActivityEntityType } from "@/types";

interface TimelineEntryProps {
  entry: ActivityLog;
  parentEntityType?: ActivityEntityType;
}

const ACTION_ICONS = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  note: MessageSquare,
} as const;

const ACTION_COLORS = {
  create: "bg-emerald-500/15 text-emerald-600",
  update: "bg-blue-500/15 text-blue-600",
  delete: "bg-red-500/15 text-red-600",
  note: "bg-amber-500/15 text-amber-600",
} as const;

const ENTITY_TYPE_BADGE_COLORS: Record<string, string> = {
  appointment: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  invoice: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  expense: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  client: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  employee: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  doctor: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  service: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export function TimelineEntry({ entry, parentEntityType }: TimelineEntryProps) {
  const t = useTranslations("activityLog");
  const locale = useLocale();

  const Icon = ACTION_ICONS[entry.action];
  const colorClass = ACTION_COLORS[entry.action];
  const isCrossEntity = parentEntityType && entry.entityType !== parentEntityType;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionText = () => {
    switch (entry.action) {
      case "create":
        return t("actionCreate");
      case "update":
        return t("actionUpdate");
      case "delete":
        return t("actionDelete");
      case "note":
        return t("actionNote");
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const key = `entityType_${type}` as Parameters<typeof t>[0];
    return t.has(key) ? t(key) : type;
  };

  return (
    <div className="flex gap-3">
      {/* Avatar / Icon */}
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="mt-1 w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">
            {entry.userName || t("system")}
          </span>
          <span className="text-xs text-muted-foreground">
            {getActionText()}
          </span>
          {isCrossEntity && (
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ENTITY_TYPE_BADGE_COLORS[entry.entityType] || "bg-secondary text-secondary-foreground"}`}>
              {getEntityTypeLabel(entry.entityType)}
            </span>
          )}
          <span className="text-xs font-english text-muted-foreground/60">
            {formatDate(entry.createdAt)}
          </span>
        </div>

        {/* Entity label for cross-entity entries */}
        {isCrossEntity && entry.entityLabel && (
          <div className="mt-0.5 text-xs font-medium text-muted-foreground">
            {entry.entityLabel}
          </div>
        )}

        {/* Note content */}
        {entry.action === "note" && entry.content && (
          <div className="mt-1.5 rounded-md bg-secondary/30 p-2.5 text-sm text-foreground">
            {entry.content}
          </div>
        )}

        {/* Change diffs */}
        {(entry.action === "update" || entry.action === "create") && entry.changes && (
          <TimelineEntryChanges changes={entry.changes} />
        )}

        {/* Attachments */}
        {entry.attachments && entry.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {att.mimeType?.startsWith("image/") ? (
                  <img
                    src={att.url}
                    alt={att.filename || t("attachment")}
                    className="h-20 w-20 rounded-md object-cover border border-border hover:opacity-80 transition-opacity"
                  />
                ) : att.mimeType?.startsWith("video/") ? (
                  <div className="h-20 w-20 rounded-md bg-secondary flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/50">
                    <FileText className="h-3 w-3" />
                    {att.filename || t("attachment")}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
