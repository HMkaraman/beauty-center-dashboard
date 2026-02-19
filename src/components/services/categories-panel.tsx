"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  useServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from "@/lib/hooks/use-service-categories";
import { useSections } from "@/lib/hooks/use-sections";
import { ServiceCategory } from "@/types";

export function CategoriesPanel() {
  const t = useTranslations("serviceCategories");
  const tc = useTranslations("common");
  const { data } = useServiceCategories();
  const categories = data?.data ?? [];
  const { data: sectionsData } = useSections({ limit: 100 });
  const sections = sectionsData?.data ?? [];
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", sectionId: "" });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", nameEn: "", sectionId: "" });
    setSheetOpen(true);
  };

  const openEdit = (cat: ServiceCategory) => {
    setEditItem(cat);
    setForm({
      name: cat.name,
      nameEn: cat.nameEn || "",
      sectionId: cat.sectionId || "",
    });
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) {
      toast.error(tc("requiredField"));
      return;
    }

    const payload = {
      name: form.name,
      nameEn: form.nameEn || undefined,
      sectionId: form.sectionId || undefined,
    };

    if (editItem) {
      updateCategory.mutate(
        { id: editItem.id, data: payload },
        {
          onSuccess: () => {
            toast.success(tc("updateSuccess"));
            setSheetOpen(false);
          },
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success(tc("addSuccess"));
          setSheetOpen(false);
        },
      });
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCategory.mutate(deleteId, {
        onSuccess: () => {
          toast.success(tc("deleteSuccess"));
          setDeleteId(null);
        },
      });
    }
  };

  // Group categories by section
  const grouped = new Map<string, ServiceCategory[]>();
  const uncategorized: ServiceCategory[] = [];
  for (const cat of categories) {
    if (cat.sectionId) {
      const list = grouped.get(cat.sectionId) || [];
      list.push(cat);
      grouped.set(cat.sectionId, list);
    } else {
      uncategorized.push(cat);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t("title")}
        </h3>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          {t("newCategory")}
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t("noCategories")}
        </p>
      ) : (
        <div className="space-y-3">
          {/* Show categories grouped by section */}
          {sections.map((section) => {
            const sectionCats = grouped.get(section.id) || [];
            if (sectionCats.length === 0) return null;
            return (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: section.color || "#6B7280" }}
                  />
                  <p className="text-xs font-medium text-muted-foreground">
                    {section.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sectionCats.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(cat.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {t("uncategorized")}
              </p>
              <div className="flex flex-wrap gap-2">
                {uncategorized.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(cat.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category form sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editItem ? tc("editItem") : t("newCategory")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {editItem ? tc("editItem") : t("newCategory")}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 px-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("nameAr")}
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("nameEn")}
              </label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="font-english"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("section")}
              </label>
              <Select
                value={form.sectionId}
                onValueChange={(v) =>
                  setForm({ ...form, sectionId: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectSection")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noSection")}</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSubmit}>{tc("save")}</Button>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              {tc("cancel")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
    </div>
  );
}
