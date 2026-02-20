"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRole, useCreateRole, useUpdateRole } from "@/lib/hooks/use-roles";
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  type PermissionCategory,
} from "@/lib/permissions";

interface RoleEditorPageProps {
  roleId?: string;
  duplicate?: boolean;
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

export function RoleEditorPage({ roleId, duplicate }: RoleEditorPageProps) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tp = useTranslations("permissions");
  const tc = useTranslations("common");
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: roleData, isLoading } = useRole(roleId);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialized, setInitialized] = useState(false);

  const isEdit = !!roleId && !duplicate;
  const role = roleData as import("@/types").RoleType | undefined;

  useEffect(() => {
    if (!roleId) {
      setInitialized(true);
      return;
    }
    if (!role) return;

    if (duplicate) {
      setForm({
        name: role.name + " (copy)",
        nameEn: role.nameEn ? role.nameEn + " (copy)" : "",
        slug: role.slug + "-copy",
        description: role.description || "",
        permissions: [...role.permissions],
      });
    } else {
      setForm({
        name: role.name,
        nameEn: role.nameEn || "",
        slug: role.slug,
        description: role.description || "",
        permissions: [...role.permissions],
      });
    }
    setInitialized(true);
  }, [role, roleId, duplicate]);

  const handleNameEnChange = (value: string) => {
    const shouldAutoSlug = !isEdit || !role?.isSystem;
    setForm((prev) => ({
      ...prev,
      nameEn: value,
      ...(shouldAutoSlug && !isEdit ? { slug: slugify(value) } : {}),
    }));
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

  const isAllSelected = ALL_PERMISSIONS.every((p) =>
    form.permissions.includes(p.key)
  );
  const isSomeSelected = ALL_PERMISSIONS.some((p) =>
    form.permissions.includes(p.key)
  );

  const toggleAll = () => {
    if (isAllSelected) {
      setForm((prev) => ({ ...prev, permissions: [] }));
    } else {
      setForm((prev) => ({
        ...prev,
        permissions: ALL_PERMISSIONS.map((p) => p.key),
      }));
    }
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

    if (isEdit && roleId) {
      updateRole.mutate(
        { id: roleId, data: payload },
        {
          onSuccess: () => {
            toast.success(tc("updateSuccess"));
            router.push("/settings/team");
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createRole.mutate(payload, {
        onSuccess: () => {
          toast.success(tc("addSuccess"));
          router.push("/settings/team");
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const getPermLabel = (labelKey: string) => {
    const parts = labelKey.replace("permissions.", "");
    return tp(parts as Parameters<typeof tp>[0]);
  };

  const getCategoryTitle = (category: PermissionCategory) => {
    return tp(`${category}.title` as Parameters<typeof tp>[0]);
  };

  if (roleId && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (roleId && !role && initialized) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Role not found
      </div>
    );
  }

  const title = isEdit
    ? t("editRole")
    : duplicate
      ? t("duplicateRole")
      : t("createRole");

  return (
    <div className="pb-24">
      {/* Back link */}
      <button
        onClick={() => router.push("/settings/team")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 rtl:hidden" />
        <ArrowRight className="h-4 w-4 ltr:hidden" />
        {t("backToTeam")}
      </button>

      <h1 className="text-xl font-semibold text-foreground mb-6">{title}</h1>

      {/* Role Details Card */}
      <div className="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t("roleDetails")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              disabled={isEdit && !!role?.isSystem}
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
        </div>
        {isEdit && role && (
          <div className="flex items-center gap-2 mt-4">
            {role.isSystem && (
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs"
              >
                {t("systemRole")}
              </Badge>
            )}
            {role.isDefault && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
              >
                {t("defaultRole")}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Permissions Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            {t("rolePermissions")}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("permissionsCount", {
                selected: form.permissions.length,
                total: ALL_PERMISSIONS.length,
              })}
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={
                  isAllSelected ? true : isSomeSelected ? "indeterminate" : false
                }
                onCheckedChange={toggleAll}
              />
              <span className="text-sm font-medium">
                {t("selectAllPermissions")}
              </span>
            </label>
          </div>
        </div>

        {/* Permission Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PERMISSION_CATEGORIES.map((category) => {
            const perms = getCategoryPermissions(category);
            if (perms.length === 0) return null;
            const allSelected = isCategoryAllSelected(category);
            const someSelected = isCategorySomeSelected(category);

            return (
              <div
                key={category}
                className="rounded-lg border border-border p-4"
              >
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => toggleCategoryAll(category)}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {getCategoryTitle(category)}
                  </span>
                </label>
                <div className="space-y-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 ps-5 cursor-pointer"
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-end gap-3 px-6 py-3 max-w-screen-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/settings/team")}
          >
            {tc("cancelAction")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createRole.isPending || updateRole.isPending}
          >
            {createRole.isPending || updateRole.isPending
              ? t("saving")
              : t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
