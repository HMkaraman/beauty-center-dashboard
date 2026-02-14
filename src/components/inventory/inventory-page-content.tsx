"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KPICard } from "@/components/ui/kpi-card";
import { InventoryCategoryChart } from "./inventory-category-chart";
import { InventoryStockChart } from "./inventory-stock-chart";
import { InventoryTable } from "./inventory-table";
import { InventoryItemCard } from "./inventory-item-card";
import { NewItemSheet } from "./new-item-sheet";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import {
  inventoryKpiData,
  inventoryByCategoryData,
  inventoryStockTrendData,
  inventoryListData,
} from "@/lib/mock-data";

export function InventoryPageContent() {
  const t = useTranslations("inventory");
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {inventoryKpiData.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <InventoryCategoryChart data={inventoryByCategoryData} />
        <InventoryStockChart data={inventoryStockTrendData} />
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("itemsList")}</h2>
          <Button onClick={() => setSheetOpen(true)} size="sm">
            <DynamicIcon name="Plus" className="h-4 w-4" />
            {t("newItem")}
          </Button>
        </div>

        <InventoryTable data={inventoryListData} />

        <div className="space-y-3 md:hidden">
          {inventoryListData.map((item) => (
            <InventoryItemCard key={item.id} data={item} />
          ))}
        </div>
      </div>

      <NewItemSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
