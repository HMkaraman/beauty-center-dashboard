"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Trash2, ExternalLink } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { KPICard } from "@/components/ui/kpi-card";
import { InventoryCategoryChart } from "./inventory-category-chart";
import { InventoryStockChart } from "./inventory-stock-chart";
import { InventoryTable } from "./inventory-table";
import { InventoryItemCard } from "./inventory-item-card";
import { NewItemSheet } from "./new-item-sheet";
import { InventoryCategoriesPanel } from "./inventory-categories-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { inventoryKpiData, inventoryByCategoryData, inventoryStockTrendData } from "@/lib/mock-data";
import { useInventoryItems, useDeleteInventoryItem, useBulkDeleteInventoryItems, useInventoryCategories } from "@/lib/hooks/use-inventory";
import { ActivitySheet } from "@/components/activity/activity-sheet";
import { InventoryItem } from "@/types";

export function InventoryPageContent() {
  const t = useTranslations("inventory"); const tc = useTranslations("common");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { data } = useInventoryItems();
  const { data: categoriesData } = useInventoryCategories();
  const categories = categoriesData?.data ?? [];
  const items = data?.data ?? [];
  const deleteInventoryItem = useDeleteInventoryItem();
  const bulkDeleteInventoryItems = useBulkDeleteInventoryItems();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [activityItem, setActivityItem] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => items.filter((item) => {
    if (categoryFilter && item.categoryId !== categoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || (item.brand || "").toLowerCase().includes(q);
  }), [items, categoryFilter, searchQuery]);

  const ids = useMemo(() => filtered.map((i) => i.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: InventoryItem) => { router.push(`/inventory/${item.id}/edit`); };
  const handleQuickEdit = (item: InventoryItem) => { setEditItem(item); setSheetOpen(true); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const confirmDelete = () => { if (deleteId) { deleteInventoryItem.mutate(deleteId, { onSuccess: () => { toast.success(tc("deleteSuccess")); } }); setDeleteId(null); } };
  const confirmBulkDelete = () => { bulkDeleteInventoryItems.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{inventoryKpiData.map((kpi) => (<KPICard key={kpi.id} data={kpi} />))}</div>
      <div className="grid gap-4 lg:grid-cols-2"><InventoryCategoryChart data={inventoryByCategoryData} /><InventoryStockChart data={inventoryStockTrendData} /></div>

      {/* Categories Management Panel */}
      <InventoryCategoriesPanel />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("itemsList")}</h2>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/inventory/new">
                <ExternalLink className="h-4 w-4" />
                {t("openFullForm")}
              </Link>
            </Button>
            <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm">
              <DynamicIcon name="Plus" className="h-4 w-4" />
              {t("newItem")}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tc("searchPlaceholder")} className="ps-9" /></div>
          {categories.length > 0 && (
            <Select value={categoryFilter || "_all"} onValueChange={(v) => setCategoryFilter(v === "_all" ? "" : v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t("allCategories")}</SelectItem>
                {categories.filter((c) => c.isActive === 1).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">{tc("noResults")}</p>) : (
          <><InventoryTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} onActivity={(item) => setActivityItem(item)} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} /><div className="space-y-3 md:hidden">{filtered.map((item) => (<InventoryItemCard key={item.id} data={item} onEdit={handleEdit} onDelete={handleDelete} />))}</div></>
        )}
      </div>
      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[{ id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) }]} />
      <NewItemSheet open={sheetOpen} onOpenChange={setSheetOpen} editItem={editItem} />
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{tc("bulkDeleteConfirmTitle")}</AlertDialogTitle><AlertDialogDescription>{tc("bulkDeleteConfirmMessage", { count: selectedCount })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel><AlertDialogAction onClick={confirmBulkDelete}>{tc("confirmDelete")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {activityItem && (
        <ActivitySheet
          open={!!activityItem}
          onOpenChange={(open) => !open && setActivityItem(null)}
          entityType="inventory_item"
          entityId={activityItem.id}
          entityLabel={`${activityItem.name} (${activityItem.sku})`}
        />
      )}
    </div>
  );
}
