"use client";

import { useTranslations } from "next-intl";

interface FieldChange {
  old: unknown;
  new: unknown;
}

interface TimelineEntryChangesProps {
  changes: Record<string, FieldChange>;
}

export function TimelineEntryChanges({ changes }: TimelineEntryChangesProps) {
  const t = useTranslations("activityLog");

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return t("emptyValue");
    }
    // Try to translate status values
    const str = String(value);
    const statusKey = `status_${str}` as Parameters<typeof t>[0];
    const translated = t.has(statusKey) ? t(statusKey) : str;
    return translated;
  };

  const getFieldLabel = (field: string): string => {
    const fieldKey = `field_${field}` as Parameters<typeof t>[0];
    return t.has(fieldKey) ? t(fieldKey) : field;
  };

  return (
    <div className="mt-2 space-y-1">
      {Object.entries(changes).map(([field, change]) => {
        const oldVal = formatValue(change.old);
        const newVal = formatValue(change.new);

        if (change.old === null || change.old === undefined || change.old === "") {
          return (
            <div key={field} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{getFieldLabel(field)}</span>
              {": "}
              {t("setTo")} <span className="font-medium text-foreground">{newVal}</span>
            </div>
          );
        }

        if (change.new === null || change.new === undefined || change.new === "") {
          return (
            <div key={field} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{getFieldLabel(field)}</span>
              {": "}
              {t("cleared")} <span className="line-through">{oldVal}</span>
            </div>
          );
        }

        return (
          <div key={field} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{getFieldLabel(field)}</span>
            {": "}
            <span className="line-through">{oldVal}</span>
            {" → "}
            <span className="font-medium text-foreground">{newVal}</span>
          </div>
        );
      })}
    </div>
  );
}
