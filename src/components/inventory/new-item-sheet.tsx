"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateInventoryItem, useUpdateInventoryItem, useInventoryCategories } from "@/lib/hooks/use-inventory";
import { InventoryItem } from "@/types";

interface NewItemSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: InventoryItem | null; }

const emptyForm = { name: "", sku: "", categoryId: "", quantity: "", unitPrice: "", reorderLevel: "" };

export function NewItemSheet({ open, onOpenChange, editItem }: NewItemSheetProps) {
  const t = useTranslations("inventory"); const tc = useTranslations("common");
  const createInventoryItem = useCreateInventoryItem();
  const updateInventoryItem = useUpdateInventoryItem();
  const { data: categoriesData } = useInventoryCategories();
  const categories = categoriesData?.data ?? [];
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        sku: editItem.sku,
        categoryId: editItem.categoryId || "",
        quantity: String(editItem.quantity),
        unitPrice: String(editItem.unitPrice),
        reorderLevel: editItem.reorderLevel != null ? String(editItem.reorderLevel) : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.categoryId) { toast.error(tc("requiredField")); return; }
    const qty = Number(form.quantity) || 0;
    const price = Number(form.unitPrice) || 0;
    const reorder = form.reorderLevel ? Number(form.reorderLevel) : undefined;

    if (editItem) {
      updateInventoryItem.mutate({ id: editItem.id, data: { name: form.name, sku: form.sku, categoryId: form.categoryId, quantity: qty, unitPrice: price, reorderLevel: reorder } }, {
        onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    } else {
      createInventoryItem.mutate({ name: form.name, sku: form.sku, categoryId: form.categoryId, quantity: qty, unitPrice: price, reorderLevel: reorder }, {
        onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="left" className="overflow-y-auto">
      <SheetHeader><SheetTitle>{editItem ? t("editItem") : t("newItem")}</SheetTitle><SheetDescription className="sr-only">{editItem ? t("editItem") : t("newItem")}</SheetDescription></SheetHeader>
      <div className="flex-1 space-y-4 px-4">
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("name")} *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("sku")} *</label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="font-english" dir="ltr" /></div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("category")} *</label>
          {categories.length > 0 ? (
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c.isActive === 1).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-muted-foreground">{t("noCategoriesHint")}</p>
          )}
        </div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("quantity")}</label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="font-english" dir="ltr" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("sellPrice")}</label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="font-english" dir="ltr" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("reorderLevel")}</label><Input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className="font-english" dir="ltr" /></div>
      </div>
      <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
    </SheetContent></Sheet>
  );
}
