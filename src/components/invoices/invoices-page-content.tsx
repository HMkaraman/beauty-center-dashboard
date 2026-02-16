"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { InvoiceTable } from "./invoice-table";
import { InvoiceCard } from "./invoice-card";
import { InvoiceDetailSheet } from "./invoice-detail-sheet";
import { NewInvoiceSheet } from "./new-invoice-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { invoicesKpiData } from "@/lib/mock-data";
import { useInvoices, useUpdateInvoice } from "@/lib/hooks/use-invoices";
import { Invoice } from "@/types";

export function InvoicesPageContent() {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useInvoices({ search: searchQuery || undefined });
  const updateInvoice = useUpdateInvoice();
  const items = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Invoice | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.invoiceNumber.toLowerCase().includes(q) ||
      item.clientName.toLowerCase().includes(q) ||
      item.clientPhone.includes(q)
    );
  });

  const handleView = (item: Invoice) => {
    setViewItem(item);
  };

  const handleVoid = (id: string) => {
    setVoidId(id);
  };

  const confirmVoid = () => {
    if (voidId) {
      updateInvoice.mutate({ id: voidId, data: { status: "void" } }, {
        onSuccess: () => {
          toast.success(t("voidSuccess"));
          setVoidId(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {invoicesKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("invoicesList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newInvoice")}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tc("searchPlaceholder")}
            className="ps-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>
        ) : (
          <>
            <InvoiceTable data={filtered} onView={handleView} onVoid={handleVoid} />
            <div className="space-y-3 md:hidden">
              {filtered.map((invoice) => (
                <InvoiceCard key={invoice.id} data={invoice} onView={handleView} onVoid={handleVoid} />
              ))}
            </div>
          </>
        )}
      </div>

      <NewInvoiceSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <InvoiceDetailSheet open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)} invoice={viewItem} />

      <AlertDialog open={!!voidId} onOpenChange={(open) => !open && setVoidId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("voidConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("voidConfirmMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmVoid}>{t("voidInvoice")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
