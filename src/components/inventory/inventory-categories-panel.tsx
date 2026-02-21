"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useInventoryCategories,
  useCreateInventoryCategory,
  useUpdateInventoryCategory,
  useDeleteInventoryCategory,
} from "@/lib/hooks/use-inventory";
import { InventoryCategory } from "@/types";

export function InventoryCategoriesPanel() {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const { data } = useInventoryCategories();
  const categories = data?.data ?? [];
  const createCategory = useCreateInventoryCategory();
  const updateCategory = useUpdateInventoryCategory();
  const deleteCategory = useDeleteInventoryCategory();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", color: "", description: "" });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", nameEn: "", color: "", description: "" });
    setSheetOpen(true);
  };

  const openEdit = (cat: InventoryCategory) => {
    setEditItem(cat);
    setForm({
      name: cat.name,
      nameEn: cat.nameEn || "",
      color: cat.color || "",
      description: cat.description || "",
    });
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error(tc("requiredField"));
      return;
    }

    const payload = {
      name: form.name,
      nameEn: form.nameEn || undefined,
      color: form.color || undefined,
      description: form.description || undefined,
    };

    try {
      if (editItem) {
        await updateCategory.mutateAsync({ id: editItem.id, data: payload });
        toast.success(tc("updateSuccess"));
      } else {
        await createCategory.mutateAsync(payload);
        toast.success(tc("addSuccess"));
      }
      setSheetOpen(false);
    } catch {
      toast.error(tc("errorOccurred"));
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

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t("categoriesTitle")}
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
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
            >
              {cat.color && (
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              <span>{cat.name}</span>
              {cat.nameEn && (
                <span className="text-muted-foreground font-english">
                  ({cat.nameEn})
                </span>
              )}
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
      )}

      {/* Category form sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editItem ? t("editCategory") : t("newCategory")}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {editItem ? t("editCategory") : t("newCategory")}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 px-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("categoryName")} *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("categoryNameEn")}
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
                {t("categoryColor")}
              </label>
              <Input
                type="color"
                value={form.color || "#6B7280"}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-20 p-1 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("description")}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
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
