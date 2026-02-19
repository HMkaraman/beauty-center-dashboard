"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { Invoice } from "@/types";
import { Price } from "@/components/ui/price";

interface InvoiceCardProps {
  data: Invoice;
  onView?: (item: Invoice) => void;
  onVoid?: (id: string) => void;
}

export function InvoiceCard({ data, onView, onVoid }: InvoiceCardProps) {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const firstItem = data.items[0]?.description || "—";
  const extraCount = data.items.length - 1;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-english font-medium text-foreground">{data.invoiceNumber}</p>
          <p className="font-medium text-foreground">{data.clientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={data.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(data)}>{t("view")}</DropdownMenuItem>
              {data.status !== "void" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onVoid?.(data.id)}>{t("voidInvoice")}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {firstItem}{extraCount > 0 && ` +${extraCount}`}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.date}</span>
        <p className="text-sm font-bold font-english text-foreground"><Price value={data.total} /></p>
      </div>
    </motion.div>
  );
}
