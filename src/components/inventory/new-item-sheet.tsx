"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inventoryCategories } from "@/lib/mock-data";

interface NewItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewItemSheet({ open, onOpenChange }: NewItemSheetProps) {
  const t = useTranslations("inventory");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    unitPrice: "",
    minStockLevel: "",
  });

  const handleSubmit = () => {
    console.log("New item:", form);
    setForm({
      name: "",
      sku: "",
      category: "",
      quantity: "",
      unitPrice: "",
      minStockLevel: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newItem")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("newItem")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("itemName")}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("sku")}</label>
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("category")}</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {inventoryCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("quantity")}</label>
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("unitPrice")}</label>
            <Input
              type="number"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("minStockLevel")}</label>
            <Input
              type="number"
              value={form.minStockLevel}
              onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
