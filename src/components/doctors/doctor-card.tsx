"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DoctorStatusBadge } from "./doctor-status-badge";
import { Doctor } from "@/types";

interface DoctorCardProps {
  data: Doctor;
}

export function DoctorCard({ data }: DoctorCardProps) {
  const t = useTranslations("doctors");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{data.name}</p>
            <p className="text-xs text-muted-foreground">{data.specialty}</p>
          </div>
        </div>
        <DoctorStatusBadge status={data.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{t("phone")}: <span className="font-english">{data.phone}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("email")}: <span className="font-english">{data.email}</span></span>
        </div>
        <div className="flex justify-between">
          <span>{t("consultations")}: <span className="font-english">{data.consultations}</span></span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs font-english text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          {data.rating > 0 ? data.rating : "—"}
        </div>
        <p className="text-xs font-english text-muted-foreground">
          {data.consultations} {t("consultationCount")}
        </p>
      </div>
    </motion.div>
  );
}
