"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import { useTranslations } from "next-intl";

export function ComingSoon() {
  const t = useTranslations("common");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
        <Construction className="h-8 w-8 text-gold" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{t("comingSoon")}</h2>
      <p className="text-muted-foreground">{t("comingSoonDesc")}</p>
    </motion.div>
  );
}
