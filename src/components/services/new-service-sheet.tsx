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
const emptyForm = { name: "", categoryId: "", category: "", duration: "", price: "", description: "", serviceType: "" as string, laserMinShots: "", laserMaxShots: "", injectableUnit: "", injectableExpiryDays: "" };

const CLEAR_SERVICE_TYPE = "__clear__";

export function NewServiceSheet({ open, onOpenChange, editItem }: NewServiceSheetProps) {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const tct = useTranslations("consumptionTracking");
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
        serviceType: editItem.serviceType || "",
        laserMinShots: editItem.laserMinShots ? String(editItem.laserMinShots) : "",
        laserMaxShots: editItem.laserMaxShots ? String(editItem.laserMaxShots) : "",
        injectableUnit: editItem.injectableUnit || "",
        injectableExpiryDays: editItem.injectableExpiryDays ? String(editItem.injectableExpiryDays) : "",
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

    // Validate service type specific fields
    if (form.serviceType === "laser") {
      if (!form.laserMinShots || !form.laserMaxShots) {
        toast.error(tct("laserShotsRequired"));
        return;
      }
    }
    if (form.serviceType === "injectable") {
      if (!form.injectableUnit || !form.injectableExpiryDays) {
        toast.error(tct("injectableFieldsRequired"));
        return;
      }
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      categoryId: form.categoryId || undefined,
      category: form.category,
      duration: Number(form.duration) || 0,
      price: Number(form.price) || 0,
      serviceType: form.serviceType || null,
      laserMinShots: form.serviceType === "laser" ? Number(form.laserMinShots) || null : null,
      laserMaxShots: form.serviceType === "laser" ? Number(form.laserMaxShots) || null : null,
      injectableUnit: form.serviceType === "injectable" ? form.injectableUnit || null : null,
      injectableExpiryDays: form.serviceType === "injectable" ? Number(form.injectableExpiryDays) || null : null,
    };
    if (editItem) {
      updateService.mutate({ id: editItem.id, data: payload }, {
        onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); },
      });
    } else {
      createService.mutate({ ...payload, status: "active" } as Parameters<typeof createService.mutate>[0], {
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

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{tct("serviceType")}</label>
            <Select
              value={form.serviceType || ""}
              onValueChange={(v) => setForm({ ...form, serviceType: v === CLEAR_SERVICE_TYPE ? "" : v })}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder={tct("serviceTypeGeneral")} /></SelectTrigger>
              <SelectContent>
                {form.serviceType && (
                  <SelectItem value={CLEAR_SERVICE_TYPE} className="text-muted-foreground">{tct("serviceTypeGeneral")}</SelectItem>
                )}
                <SelectItem value="laser">{tct("serviceTypeLaser")}</SelectItem>
                <SelectItem value="injectable">{tct("serviceTypeInjectable")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Laser fields */}
          {form.serviceType === "laser" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{tct("laserMinShots")}</label>
                <Input type="number" value={form.laserMinShots} onChange={(e) => setForm({ ...form, laserMinShots: e.target.value })} className="font-english" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{tct("laserMaxShots")}</label>
                <Input type="number" value={form.laserMaxShots} onChange={(e) => setForm({ ...form, laserMaxShots: e.target.value })} className="font-english" />
              </div>
            </>
          )}

          {/* Injectable fields */}
          {form.serviceType === "injectable" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{tct("injectableUnit")}</label>
                <Select value={form.injectableUnit} onValueChange={(v) => setForm({ ...form, injectableUnit: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={tct("selectUnit")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">{tct("unitUnits")}</SelectItem>
                    <SelectItem value="cc">{tct("unitCc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{tct("injectableExpiryDays")}</label>
                <Input type="number" value={form.injectableExpiryDays} onChange={(e) => setForm({ ...form, injectableExpiryDays: e.target.value })} className="font-english" />
              </div>
            </>
          )}
        </div>
        <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
