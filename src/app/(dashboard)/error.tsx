"use client";

import { useTranslations } from "next-intl";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red/15">
        <span className="text-2xl text-red">!</span>
      </div>
      <h2 className="text-lg font-semibold text-foreground">{t("error")}</h2>
      <button
        onClick={reset}
        className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold-light"
      >
        {t("retry")}
      </button>
    </div>
  );
}
