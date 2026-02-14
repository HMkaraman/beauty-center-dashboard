"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { KPICard } from "@/components/ui/kpi-card";
import { FinanceRevenueChart } from "./finance-revenue-chart";
import { FinanceAreaChart } from "./finance-area-chart";
import { FinanceTable } from "./finance-table";
import { TransactionCard } from "./transaction-card";
import { NewTransactionSheet } from "./new-transaction-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { financeKpiData, financeRevenueByCategoryData, financeRevenueExpensesTrendData } from "@/lib/mock-data";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Transaction } from "@/types";

export function FinancePageContent() {
  const t = useTranslations("finance"); const tc = useTranslations("common");
  const { items, searchQuery, setSearchQuery, deleteItem } = useFinanceStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = items.filter((item) => { if (!searchQuery) return true; const q = searchQuery.toLowerCase(); return item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q); });
  const handleEdit = (item: Transaction) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteItem(deleteId); toast.success(tc("deleteSuccess")); setDeleteId(null); } };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{financeKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><FinanceRevenueChart data={financeRevenueByCategoryData} /><FinanceAreaChart data={financeRevenueExpensesTrendData} /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-foreground">{t("transactionsList")}</h2><Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm"><DynamicIcon name="Plus" className="h-4 w-4" />{t("newTransaction")}</Button></div>
        <div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><FinanceTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} /><div className="space-y-3 md:hidden">{filtered.map((t2) => (<TransactionCard key={t2.id} data={t2} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <NewTransactionSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
