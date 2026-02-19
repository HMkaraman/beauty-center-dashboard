"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceCategories } from "@/lib/hooks/use-service-categories";
import { useCreateService, useUpdateService } from "@/lib/hooks/use-services";
import { Service } from "@/types";

interface NewServiceSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Service | null; }
const emptyForm = { name: "", categoryId: "", category: "", duration: "", price: "", description: "" };

export function NewServiceSheet({ open, onOpenChange, editItem }: NewServiceSheetProps) {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const createService = useCreateService();
  const updateService = useUpdateService();
  const { data: categoriesData } = useServiceCategories();
  const categories = categoriesData?.data ?? [];
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        categoryId: editItem.categoryId || "",
        category: editItem.category,
        duration: String(editItem.duration),
        price: String(editItem.price),
        description: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleCategoryChange = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setForm({
      ...form,
      categoryId,
      category: cat?.name || form.category,
    });
  };

  const handleSubmit = () => {
    if (!form.name || (!form.categoryId && !form.category) || !form.price) {
      toast.error(tc("requiredField"));
      return;
    }
    const payload = {
      name: form.name,
      categoryId: form.categoryId || undefined,
      category: form.category,
      duration: Number(form.duration) || 0,
      price: Number(form.price) || 0,
    };
    if (editItem) {
      updateService.mutate({ id: editItem.id, data: payload }, {
        onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    } else {
      createService.mutate({ ...payload, status: "active" }, {
        onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newService")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newService")}</SheetDescription></SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("name")}</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("category")}</label>
            {categories.length > 0 ? (
              <Select value={form.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder={t("selectCategory")}
              />
            )}
          </div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("duration")}</label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="font-english" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("price")}</label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="font-english" /></div>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("description")}</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
