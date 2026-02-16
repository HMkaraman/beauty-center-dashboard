"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { portalApi, type PortalInvoice } from "@/lib/api/portal";

export default function PortalInvoicesPage() {
  const t = useTranslations("portal");
  const router = useRouter();

  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    try {
      const data = await portalApi.getInvoices();
      setInvoices(data.data);
    } catch {
      // Token may be invalid; redirect handled by portalFetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    if (!token) {
      router.push("/portal");
      return;
    }
    loadInvoices();
  }, [router, loadInvoices]);

  const statusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green/20 text-green";
      case "unpaid":
        return "bg-gold/20 text-gold";
      case "void":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {t("invoices")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("noInvoices")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                      <FileText className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground font-mono" dir="ltr">
                        #{invoice.invoiceNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono" dir="ltr">
                        {invoice.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                    <span className="text-sm font-semibold text-gold font-mono" dir="ltr">
                      {invoice.total}
                    </span>
                  </div>
                </div>

                {/* Invoice breakdown */}
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("subtotal") || "Subtotal"}</span>
                    <span className="font-mono" dir="ltr">{invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("tax") || "Tax"}</span>
                    <span className="font-mono" dir="ltr">{invoice.taxAmount}</span>
                  </div>
                  {invoice.paymentMethod && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {invoice.paymentMethod}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
