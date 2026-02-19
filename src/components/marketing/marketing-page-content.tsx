"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Trash2, Play, Pause, CheckCircle, FileEdit } from "lucide-react";
import { useRowSelection } from "@/hooks/use-row-selection";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { KPICard } from "@/components/ui/kpi-card";
import { MarketingChannelChart } from "./marketing-channel-chart";
import { MarketingReachChart } from "./marketing-reach-chart";
import { MarketingTable } from "./marketing-table";
import { CampaignCard } from "./campaign-card";
import { NewCampaignSheet } from "./new-campaign-sheet";
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
import {
  marketingKpiData,
  marketingByChannelData,
  marketingReachTrendData,
} from "@/lib/mock-data";
import { useCampaigns, useDeleteCampaign, useBulkDeleteCampaigns, useBulkUpdateCampaignStatus } from "@/lib/hooks/use-marketing";
import { Campaign } from "@/types";

export function MarketingPageContent() {
  const t = useTranslations("marketing");
  const tc = useTranslations("common");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useCampaigns({ search: searchQuery || undefined });
  const deleteCampaign = useDeleteCampaign();
  const bulkDeleteCampaigns = useBulkDeleteCampaigns();
  const bulkUpdateStatus = useBulkUpdateCampaignStatus();
  const items = data?.data ?? [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.channel.toLowerCase().includes(q)
    );
  });

  const ids = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const { selectedIds, selectedCount, isAllSelected, isSomeSelected, toggle, toggleAll, clearSelection } = useRowSelection(ids);

  const handleEdit = (item: Campaign) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCampaign.mutate(deleteId, {
        onSuccess: () => {
          toast.success(tc("deleteSuccess"));
          setDeleteId(null);
        },
      });
    }
  };

  const confirmBulkDelete = () => { bulkDeleteCampaigns.mutate(selectedIds, { onSuccess: (res) => { toast.success(tc("bulkDeleteSuccess", { count: res.deleted })); clearSelection(); setBulkDeleteOpen(false); } }); };
  const handleBulkStatus = (status: string) => { setPendingStatus(status); setBulkStatusOpen(true); };
  const confirmBulkStatus = () => { bulkUpdateStatus.mutate({ ids: selectedIds, status: pendingStatus }, { onSuccess: (res) => { toast.success(tc("bulkStatusSuccess", { count: res.updated })); clearSelection(); setBulkStatusOpen(false); } }); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {marketingKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketingChannelChart data={marketingByChannelData} />
        <MarketingReachChart data={marketingReachTrendData} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("campaignsList")}</h2>
          <Button onClick={() => { setEditItem(null); setSheetOpen(true); }} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newCampaign")}
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
            <MarketingTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} selectedIds={selectedIds} onToggle={toggle} onToggleAll={toggleAll} isAllSelected={isAllSelected} isSomeSelected={isSomeSelected} />
            <div className="space-y-3 md:hidden">
              {filtered.map((campaign) => (
                <CampaignCard key={campaign.id} data={campaign} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>

      <BulkActionBar selectedCount={selectedCount} onClearSelection={clearSelection} label={tc("selected", { count: selectedCount })} actions={[
        { id: "status-active", label: t("statusActive"), variant: "outline", icon: <Play className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("active") },
        { id: "status-paused", label: t("statusPaused"), variant: "outline", icon: <Pause className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("paused") },
        { id: "status-completed", label: t("statusCompleted"), variant: "outline", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("completed") },
        { id: "status-draft", label: t("statusDraft"), variant: "outline", icon: <FileEdit className="h-3.5 w-3.5" />, onClick: () => handleBulkStatus("draft") },
        { id: "bulk-delete", label: tc("bulkDelete"), variant: "destructive", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: () => setBulkDeleteOpen(true) },
      ]} />

      <NewCampaignSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("deleteConfirmMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{tc("confirmDelete")}</AlertDialogAction>
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
      <AlertDialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("bulkStatusConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("bulkStatusConfirmMessage", { count: selectedCount, status: pendingStatus })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancelAction")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkStatus}>{tc("bulkStatusChange")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
