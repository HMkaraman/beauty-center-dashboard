"use client";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { Transaction } from "@/types";
import { Price } from "@/components/ui/price";

interface TransactionCardProps { data: Transaction; onEdit?: (item: Transaction) => void; onDelete?: (id: string) => void; }

export function TransactionCard({ data, onEdit, onDelete }: TransactionCardProps) {
  const t = useTranslations("finance");
  const locale = useLocale();
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }} transition={{ duration: 0.2 }} className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between">
        <div><p className="font-medium text-foreground">{data.description}</p><p className="text-xs text-muted-foreground">{data.category}</p></div>
        <div className="flex items-center gap-2"><TransactionTypeBadge type={data.type} />
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.date}</span>
        <p className="text-sm font-bold font-english text-foreground"><Price value={data.amount} /></p>
      </div>
    </motion.div>
  );
}
