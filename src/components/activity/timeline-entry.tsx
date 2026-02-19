"use client";

import { useTranslations, useLocale } from "next-intl";
import { Plus, Pencil, Trash2, MessageSquare, Play, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TimelineEntryChanges } from "./timeline-entry-changes";
import type { ActivityLog } from "@/types";

interface TimelineEntryProps {
  entry: ActivityLog;
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

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const t = useTranslations("activityLog");
  const locale = useLocale();

  const Icon = ACTION_ICONS[entry.action];
  const colorClass = ACTION_COLORS[entry.action];

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
          <span className="text-xs font-english text-muted-foreground/60">
            {formatDate(entry.createdAt)}
          </span>
        </div>

        {/* Note content */}
        {entry.action === "note" && entry.content && (
          <div className="mt-1.5 rounded-md bg-secondary/30 p-2.5 text-sm text-foreground">
            {entry.content}
          </div>
        )}

        {/* Change diffs */}
        {entry.action === "update" && entry.changes && (
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
