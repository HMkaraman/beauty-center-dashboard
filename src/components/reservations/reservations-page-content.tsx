"use client";

import { useTranslations } from "next-intl";
import { Syringe } from "lucide-react";
import { ReservationsTable } from "./reservations-table";

export function ReservationsPageContent() {
  const t = useTranslations("reservations");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Syringe className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
      </div>

      <ReservationsTable />
    </div>
  );
}
