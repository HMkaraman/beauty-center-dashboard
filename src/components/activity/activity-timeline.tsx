"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteComposer } from "./note-composer";
import { TimelineEntry } from "./timeline-entry";
import { useActivityLogs } from "@/lib/hooks/use-activity-logs";
import type { ActivityEntityType } from "@/types";

interface ActivityTimelineProps {
  entityType: ActivityEntityType;
  entityId: string;
  title?: string;
}

const PAGE_SIZE = 20;

export function ActivityTimeline({ entityType, entityId, title }: ActivityTimelineProps) {
  const t = useTranslations("activityLog");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useActivityLogs(entityType, entityId, {
    page,
    limit: PAGE_SIZE,
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.totalPages : false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          {title || t("title")}
        </h3>
      </div>

      {/* Note Composer */}
      <NoteComposer entityType={entityType} entityId={entityId} />

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t("noActivity")}
        </div>
      ) : (
        <div className="space-y-0">
          {logs.map((entry) => (
            <TimelineEntry key={entry.id} entry={entry} parentEntityType={entityType} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
          >
            {t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
