"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActivityTimeline } from "./activity-timeline";
import type { ActivityEntityType } from "@/types";

interface ActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: ActivityEntityType;
  entityId: string;
  entityLabel?: string;
}

export function ActivitySheet({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityLabel,
}: ActivitySheetProps) {
  const t = useTranslations("activityLog");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {t("title")}
            {entityLabel && (
              <span className="block text-sm font-normal text-muted-foreground">
                {entityLabel}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ActivityTimeline entityType={entityType} entityId={entityId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
