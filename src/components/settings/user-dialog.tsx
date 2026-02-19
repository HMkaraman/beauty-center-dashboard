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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-users";
import { useRoles } from "@/lib/hooks/use-roles";
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  type PermissionCategory,
} from "@/lib/permissions";
import type { AdminUser, RoleType } from "@/types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: AdminUser | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  roleId: string;
  overrideGranted: Set<string>;
  overrideRevoked: Set<string>;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  overrideGranted: new Set(),
  overrideRevoked: new Set(),
};

export function UserDialog({ open, onOpenChange, editItem }: UserDialogProps) {
  const t = useTranslations("settings");
  const tp = useTranslations("permissions");
  const tc = useTranslations("common");
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: rolesData } = useRoles();
  const roles = rolesData?.data ?? [];
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showOverrides, setShowOverrides] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const selectedRole = roles.find((r) => r.id === form.roleId);
  const rolePermissions = selectedRole?.permissions ?? [];

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        email: editItem.email,
        password: "",
        roleId: editItem.roleId || "",
        overrideGranted: new Set(editItem.customPermissions?.granted ?? []),
        overrideRevoked: new Set(editItem.customPermissions?.revoked ?? []),
      });
      setShowOverrides(
        !!(
          editItem.customPermissions?.granted?.length ||
          editItem.customPermissions?.revoked?.length
        )
      );
    } else {
      setForm(emptyForm);
      setShowOverrides(false);
    }
    setExpandedCategories(new Set());
  }, [editItem, open]);

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

  // 3-state toggle for override permissions:
  // If role grants it and not revoked → "inherited" (dimmed check)
  // If role denies it and not granted → "inherited deny" (unchecked)
  // If explicitly granted → green check
  // If explicitly revoked → red X
  const getPermState = (
    key: string
  ): "inherited-on" | "inherited-off" | "granted" | "revoked" => {
    if (form.overrideGranted.has(key)) return "granted";
    if (form.overrideRevoked.has(key)) return "revoked";
    if (rolePermissions.includes(key)) return "inherited-on";
    return "inherited-off";
  };

  const cyclePermState = (key: string) => {
    const state = getPermState(key);
    const roleHas = rolePermissions.includes(key);

    setForm((prev) => {
      const granted = new Set(prev.overrideGranted);
      const revoked = new Set(prev.overrideRevoked);

      if (roleHas) {
        // inherited-on → revoked → inherited-on
        if (state === "inherited-on") {
          revoked.add(key);
        } else if (state === "revoked") {
          revoked.delete(key);
        }
      } else {
        // inherited-off → granted → inherited-off
        if (state === "inherited-off") {
          granted.add(key);
        } else if (state === "granted") {
          granted.delete(key);
        }
      }

      return { ...prev, overrideGranted: granted, overrideRevoked: revoked };
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      toast.error(tc("requiredField"));
      return;
    }

    if (editItem) {
      const hasOverrides =
        form.overrideGranted.size > 0 || form.overrideRevoked.size > 0;
      updateUser.mutate(
        {
          id: editItem.id,
          data: {
            name: form.name,
            email: form.email,
            roleId: form.roleId || undefined,
            customPermissions: hasOverrides
              ? {
                  granted: Array.from(form.overrideGranted),
                  revoked: Array.from(form.overrideRevoked),
                }
              : null,
          },
        },
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
      if (!form.password || form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (!form.roleId) {
        toast.error(tc("requiredField"));
        return;
      }
      createUser.mutate(
        {
          name: form.name,
          email: form.email,
          password: form.password,
          roleId: form.roleId,
        },
        {
          onSuccess: () => {
            toast.success(tc("addSuccess"));
            setForm(emptyForm);
            onOpenChange(false);
          },
          onError: (err) => toast.error(err.message),
        }
      );
    }
  };

  const getPermLabel = (labelKey: string) => {
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
            {editItem ? t("editUser") : t("addUser")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? t("editUser") : t("addUser")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("userName")}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("userEmail")}
            </label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              className="font-english"
              dir="ltr"
            />
          </div>
          {!editItem && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("userPassword")}
              </label>
              <Input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type="password"
                dir="ltr"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("userRole")}
            </label>
            <Select
              value={form.roleId}
              onValueChange={(v) => {
                setForm((prev) => ({
                  ...prev,
                  roleId: v,
                  overrideGranted: new Set(),
                  overrideRevoked: new Set(),
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("userRole")} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                    {role.nameEn ? ` (${role.nameEn})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permission overrides (only for edit) */}
          {editItem && form.roleId && (
            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setShowOverrides(!showOverrides)}
              >
                {showOverrides ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                {t("permissionOverrides")}
              </button>

              {showOverrides && (
                <div className="border border-border rounded-lg divide-y divide-border">
                  <div className="px-3 py-2 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-muted border border-border" />
                      {t("inheritedFromRole")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
                      {t("explicitlyGranted")}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
                      {t("explicitlyRevoked")}
                    </div>
                  </div>
                  {PERMISSION_CATEGORIES.map((category) => {
                    const perms = getCategoryPermissions(category);
                    if (perms.length === 0) return null;
                    const isExpanded = expandedCategories.has(category);

                    return (
                      <div key={category}>
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/50 transition-colors"
                          onClick={() => toggleCategory(category)}
                        >
                          <span className="text-sm font-medium">
                            {getCategoryTitle(category)}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2">
                            {perms.map((perm) => {
                              const state = getPermState(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-2 ps-4 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    cyclePermState(perm.key);
                                  }}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center h-4 w-4 rounded-sm border text-xs ${
                                      state === "granted"
                                        ? "bg-green-500 border-green-500 text-white"
                                        : state === "revoked"
                                          ? "bg-red-500 border-red-500 text-white"
                                          : state === "inherited-on"
                                            ? "bg-primary/30 border-primary/50 text-primary"
                                            : "bg-muted border-border"
                                    }`}
                                  >
                                    {(state === "granted" ||
                                      state === "inherited-on") &&
                                      "✓"}
                                    {state === "revoked" && "✕"}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {getPermLabel(perm.labelKey)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={createUser.isPending || updateUser.isPending}
          >
            {createUser.isPending || updateUser.isPending
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
