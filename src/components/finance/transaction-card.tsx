"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TransactionTypeBadge } from "./transaction-type-badge";
import { formatCurrency } from "@/lib/formatters";
import { Transaction } from "@/types";

interface TransactionCardProps {
  data: Transaction;
}

export function TransactionCard({ data }: TransactionCardProps) {
  const t = useTranslations("finance");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-4 md:hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{data.description}</p>
          <p className="text-xs text-muted-foreground">{data.category}</p>
        </div>
        <TransactionTypeBadge type={data.type} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-english text-muted-foreground">{data.date}</span>
        <p className="text-sm font-bold font-english text-foreground">
          {formatCurrency(data.amount)}
        </p>
      </div>
    </motion.div>
  );
}
