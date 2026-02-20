"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventoryItems } from "@/lib/hooks";

export interface InventoryRow {
  inventoryItemId: string;
  quantityRequired: number;
}

interface ServiceInventoryEditorProps {
  rows: InventoryRow[];
  onChange: (rows: InventoryRow[]) => void;
}

export function ServiceInventoryEditor({ rows, onChange }: ServiceInventoryEditorProps) {
  const t = useTranslations("services");
  const { data: inventoryData } = useInventoryItems({ limit: 200 });
  const items = inventoryData?.data ?? [];

  const addRow = () => {
    onChange([...rows, { inventoryItemId: "", quantityRequired: 1 }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof InventoryRow, value: string | number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select
            value={row.inventoryItemId}
            onValueChange={(v) => updateRow(i, "inventoryItemId", v)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("selectInventoryItem")} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            value={row.quantityRequired}
            onChange={(e) => updateRow(i, "quantityRequired", Number(e.target.value) || 1)}
            className="w-20 font-english"
            placeholder={t("quantity")}
          />
          <Button variant="ghost" size="icon-xs" onClick={() => removeRow(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        {t("addRow")}
      </Button>
    </div>
  );
}
