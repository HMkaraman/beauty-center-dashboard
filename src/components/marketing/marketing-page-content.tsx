"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search } from "lucide-react";
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
import { useMarketingStore } from "@/store/useMarketingStore";
import { Campaign } from "@/types";

export function MarketingPageContent() {
  const t = useTranslations("marketing");
  const tc = useTranslations("common");
  const { items, searchQuery, setSearchQuery, deleteItem } = useMarketingStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.channel.toLowerCase().includes(q)
    );
  });

  const handleEdit = (item: Campaign) => {
    setEditItem(item);
    setSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteItem(deleteId);
      toast.success(tc("deleteSuccess"));
      setDeleteId(null);
    }
  };

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
            <MarketingTable data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
            <div className="space-y-3 md:hidden">
              {filtered.map((campaign) => (
                <CampaignCard key={campaign.id} data={campaign} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>

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
    </div>
  );
}
