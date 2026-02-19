"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { FinanceTable } from "./finance-table";
import { TransactionCard } from "./transaction-card";
import { NewTransactionSheet } from "./new-transaction-sheet";
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
import { useTransactions, useDeleteTransaction, useBulkDeleteTransactions } from "@/lib/hooks/use-finance";
import { Transaction } from "@/types";

export function FinanceTransactionsTab() {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useTransactions({ search: searchQuery || undefined });
  const deleteTransaction = useDeleteTransaction();
  const bulkDeleteTransactions = useBulkDeleteTransactions();
  const items = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const ids = useMemo(() => filtered.map((t2) => t2.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Transaction) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTransaction.mutate(deleteId, {
        onSuccess: () => {
          toast.success(tc("deleteSuccess"));
          setDeleteId(null);
        },
      });
    }
  };

  const confirmBulkDelete = () => { bulkDeleteTransactions.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t("transactionsList")}
        </h2>
        <Button
          onClick={() => {
            setEditItem(null);
            setSheetOpen(true);
          }}
          size="sm"
        >
          <DynamicIcon name="Plus" className="h-4 w-4" />
          {t("newTransaction")}
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
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tc("noResults")}
        </p>
      ) : (
        <>
          <FinanceTable
            data={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onToggle={toggle}
            onToggleAll={toggleAll}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
          />
          <div className="space-y-3 md:hidden">
            {filtered.map((t2) => (
              <TransactionCard
                key={t2.id}
                data={t2}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[{ id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) }]} />
      <NewTransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editItem={editItem}
      />
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tc("deleteConfirmMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {tc("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("bulkDeleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("bulkDeleteConfirmMessage", { count: selectedCount })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>{tc("confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
