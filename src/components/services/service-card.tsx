"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ServiceStatusBadge } from "./service-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Service } from "@/types";

interface ServiceCardProps { data: Service; onEdit?: (item: Service) => void; onDelete?: (id: string) => void; }

export function ServiceCard({ data, onEdit, onDelete }: ServiceCardProps) {
  const t = useTranslations("services");
  const locale = useLocale();
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }} transition={{ duration: 0.2 }} className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3"><Avatar size="sm"><AvatarFallback>{data.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-medium text-foreground">{data.name}</p><p className="text-xs text-muted-foreground">{data.category}</p></div></div>
        <div className="flex items-center gap-2"><ServiceStatusBadge status={data.status} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs font-english text-muted-foreground"><span>{data.duration}{t("minutes")}</span></div>
        <p className="text-sm font-bold font-english text-foreground">{formatCurrency(data.price, locale)}</p>
      </div>
    </motion.div>
  );
}
