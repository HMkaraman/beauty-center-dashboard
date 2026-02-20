"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useClientActiveReservations } from "@/lib/hooks/use-reservations";

interface ClientLeftoverBannerProps {
  clientId: string | undefined;
}

export function ClientLeftoverBanner({ clientId }: ClientLeftoverBannerProps) {
  const t = useTranslations("reservations");
  const { data } = useClientActiveReservations(clientId);
  const reservations = data?.data ?? [];

  if (reservations.length === 0) return null;

  return (
    <div className="space-y-2">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/50"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t("leftoverAlert", {
                product: reservation.productName,
                amount: String(reservation.remainingAmount),
                unit: reservation.unit,
                date: reservation.expiryDate || "",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
