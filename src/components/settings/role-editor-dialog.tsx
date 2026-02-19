"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, ChevronLeft } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateRole, useUpdateRole } from "@/lib/hooks/use-roles";
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  type PermissionCategory,
} from "@/lib/permissions";
import type { RoleType } from "@/types";

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: RoleType | null;
  duplicateFrom?: RoleType | null;
}

interface FormState {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  permissions: string[];
}

const emptyForm: FormState = {
  name: "",
  nameEn: "",
  slug: "",
  description: "",
  permissions: [],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

export function RoleEditorDialog({
  open,
  onOpenChange,
  editItem,
  duplicateFrom,
}: RoleEditorDialogProps) {
  const t = useTranslations("settings");
  const tp = useTranslations("permissions");
  const tc = useTranslations("common");
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        nameEn: editItem.nameEn || "",
        slug: editItem.slug,
        description: editItem.description || "",
        permissions: editItem.permissions,
      });
    } else if (duplicateFrom) {
      setForm({
        name: duplicateFrom.name + " (copy)",
        nameEn: duplicateFrom.nameEn ? duplicateFrom.nameEn + " (copy)" : "",
        slug: duplicateFrom.slug + "-copy",
        description: duplicateFrom.description || "",
        permissions: [...duplicateFrom.permissions],
      });
    } else {
      setForm(emptyForm);
    }
    setExpandedCategories(new Set());
  }, [editItem, duplicateFrom, open]);

  const handleNameEnChange = (value: string) => {
    const shouldAutoSlug = !editItem || !editItem.isSystem;
    setForm((prev) => ({
      ...prev,
      nameEn: value,
      ...(shouldAutoSlug && !editItem ? { slug: slugify(value) } : {}),
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const getCategoryPermissions = (category: PermissionCategory) =>
    ALL_PERMISSIONS.filter((p) => p.category === category);

  const isCategoryAllSelected = (category: PermissionCategory) => {
    const perms = getCategoryPermissions(category);
    return perms.every((p) => form.permissions.includes(p.key));
  };

  const isCategorySomeSelected = (category: PermissionCategory) => {
    const perms = getCategoryPermissions(category);
    return perms.some((p) => form.permissions.includes(p.key));
  };

  const toggleCategoryAll = (category: PermissionCategory) => {
    const perms = getCategoryPermissions(category);
    const allSelected = isCategoryAllSelected(category);
    if (allSelected) {
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (p) => !perms.some((cp) => cp.key === p)
        ),
      }));
    } else {
      const newPerms = new Set(form.permissions);
      perms.forEach((p) => newPerms.add(p.key));
      setForm((prev) => ({ ...prev, permissions: Array.from(newPerms) }));
    }
  };

  const togglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSubmit = () => {
    if (!form.name) {
      toast.error(tc("requiredField"));
      return;
    }
    if (!form.slug) {
      toast.error(tc("requiredField"));
      return;
    }

    const payload = {
      name: form.name,
      nameEn: form.nameEn || undefined,
      slug: form.slug,
      description: form.description || undefined,
      permissions: form.permissions,
    };

    if (editItem) {
      updateRole.mutate(
        { id: editItem.id, data: payload },
        {
          onSuccess: () => {
            toast.success(tc("updateSuccess"));
            setForm(emptyForm);
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createRole.mutate(payload, {
        onSuccess: () => {
          toast.success(tc("addSuccess"));
          setForm(emptyForm);
          onOpenChange(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  // Helper to resolve the permission label key like "permissions.clients.read"
  const getPermLabel = (labelKey: string) => {
    // labelKey = "permissions.clients.read" → we need tp("clients.read")
    const parts = labelKey.replace("permissions.", "");
    return tp(parts as Parameters<typeof tp>[0]);
  };

  const getCategoryTitle = (category: PermissionCategory) => {
    return tp(`${category}.title` as Parameters<typeof tp>[0]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {editItem ? t("editRole") : duplicateFrom ? t("duplicateRole") : t("addRole")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? t("editRole") : t("addRole")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          {/* Name fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("roleName")}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("roleNameEn")}
            </label>
            <Input
              value={form.nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("roleSlug")}
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="font-english"
              dir="ltr"
              disabled={!!editItem?.isSystem}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("roleDescription")}
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* Permissions grid */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("rolePermissions")}
            </label>
            <div className="border border-border rounded-lg divide-y divide-border">
              {PERMISSION_CATEGORIES.map((category) => {
                const perms = getCategoryPermissions(category);
                if (perms.length === 0) return null;
                const isExpanded = expandedCategories.has(category);
                const allSelected = isCategoryAllSelected(category);
                const someSelected = isCategorySomeSelected(category);

                return (
                  <div key={category}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer select-none"
                      onClick={() => toggleCategory(category)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleCategory(category);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            allSelected
                              ? true
                              : someSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={() => toggleCategoryAll(category)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm font-medium">
                          {getCategoryTitle(category)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({perms.filter((p) => form.permissions.includes(p.key)).length}/{perms.length})
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {perms.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-2 ps-6 cursor-pointer"
                          >
                            <Checkbox
                              checked={form.permissions.includes(perm.key)}
                              onCheckedChange={() => togglePermission(perm.key)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {getPermLabel(perm.labelKey)}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={createRole.isPending || updateRole.isPending}
          >
            {createRole.isPending || updateRole.isPending
              ? t("saving")
              : t("save")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc("cancelAction")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
