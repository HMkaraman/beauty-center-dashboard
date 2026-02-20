"use client";

import { useTranslations } from "next-intl";
import type { ReservationStatus } from "@/types";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  used: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  disposed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_KEYS: Record<ReservationStatus, string> = {
  active: "statusActive",
  used: "statusUsed",
  expired: "statusExpired",
  disposed: "statusDisposed",
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const t = useTranslations("reservations");

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {t(STATUS_KEYS[status] as "statusActive")}
    </span>
  );
}
