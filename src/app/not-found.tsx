"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
        <Sparkles className="h-8 w-8 text-gold" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold font-english text-gold">{t("title")}</h1>
        <p className="text-xl font-semibold text-foreground">{t("message")}</p>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Button asChild>
        <Link href="/">{t("backToDashboard")}</Link>
      </Button>
    </div>
  );
}
