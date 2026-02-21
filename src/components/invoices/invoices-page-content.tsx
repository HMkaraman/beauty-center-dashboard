"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Ban } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
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
import { useInvoices, useUpdateInvoice, useBulkVoidInvoices } from "@/lib/hooks/use-invoices";
import { Invoice } from "@/types";

export function InvoicesPageContent() {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useInvoices({ search: searchQuery || undefined });
  const updateInvoice = useUpdateInvoice();
  const bulkVoidInvoices = useBulkVoidInvoices();
  const items = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewItem, setViewItem] = useState<Invoice | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);
  const [bulkVoidOpen, setBulkVoidOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("newInvoice") === "true") {
      setSheetOpen(true);
      router.replace("/finance", { scroll: false });
    }
  }, [searchParams, router]);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.invoiceNumber.toLowerCase().includes(q) ||
      item.clientName.toLowerCase().includes(q) ||
      item.clientPhone.includes(q)
    );
  });

  const ids = useMemo(() => filtered.map((i) => i.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

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

  const confirmBulkVoid = () => { bulkVoidInvoices.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkVoidSuccess", { count: res.voided })); clearSelection(); setBulkVoidOpen(false); } }); };

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
            <InvoiceTable data={filtered} onView={handleView} onVoid={handleVoid} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
            <div className="space-y-3 md:hidden">
              {filtered.map((invoice) => (
                <InvoiceCard key={invoice.id} data={invoice} onView={handleView} onVoid={handleVoid} />
              ))}
            </div>
          </>
        )}
      </div>

      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[{ id: "bulk-void", label: tc("bulkVoid"), variant: "destructive", icon: <Ban className="h-3.5 w-3.5" />, onClick: () => setBulkVoidOpen(true) }]} />

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
      <AlertDialog open={bulkVoidOpen} onOpenChange={setBulkVoidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("bulkVoidConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("bulkVoidConfirmMessage", { count: selectedCount })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkVoid}>{tc("bulkVoid")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
