"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  currentStatus: string;
  onMove: (newStatus: string) => void;
}

const STATUS_OPTIONS: { key: string; labelKey: string; status: string }[] = [
  { key: "upcoming", labelKey: "upcoming", status: "confirmed" },
  { key: "waiting", labelKey: "waiting", status: "waiting" },
  { key: "in-progress", labelKey: "inProgress", status: "in-progress" },
  { key: "completed", labelKey: "completed", status: "completed" },
];

// Map raw appointment statuses to their column key
function statusToColumnKey(status: string): string {
  if (status === "confirmed" || status === "pending") return "upcoming";
  return status;
}

export function StatusSelect({ currentStatus, onMove }: StatusSelectProps) {
  const t = useTranslations("reception");
  const currentColumn = statusToColumnKey(currentStatus);

  // No move options for completed
  if (currentStatus === "completed") return null;

  const options = STATUS_OPTIONS.filter((opt) => opt.key !== currentColumn);

  return (
    <Select
      value=""
      onValueChange={(newStatus) => {
        if (newStatus) onMove(newStatus);
      }}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={t("moveTo")} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.key} value={opt.status} className="text-xs">
            {t(opt.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
