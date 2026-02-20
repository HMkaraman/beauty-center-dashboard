"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Copy, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useRoles, useDeleteRole } from "@/lib/hooks/use-roles";

export function RolesCard() {
  const router = useRouter();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data } = useRoles();
  const roles = data?.data ?? [];
  const deleteRole = useDeleteRole();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const roleToDelete = deleteId ? roles.find((r) => r.id === deleteId) : null;

  const confirmDelete = () => {
    if (deleteId) {
      deleteRole.mutate(deleteId, {
        onSuccess: () => {
          toast.success(tc("deleteSuccess"));
          setDeleteId(null);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("roles")}
        </h3>
        <Button size="sm" onClick={() => router.push("/settings/team/roles/new")}>
          <Plus className="h-4 w-4" />
          {t("addRole")}
        </Button>
      </div>

      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {t("noRoles")}
        </p>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {role.name}
                  </p>
                  {role.nameEn && (
                    <p className="text-xs text-muted-foreground font-english">
                      {role.nameEn}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      role.isSystem
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs"
                        : "border-green-500/30 bg-green-500/10 text-green-400 text-xs"
                    }
                  >
                    {role.isSystem ? t("systemRole") : t("customRole")}
                  </Badge>
                  {role.isDefault && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
                    >
                      {t("defaultRole")}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {t("usersCount", { count: role.userCount })}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/settings/team/roles/${role.id}?duplicate=true`)}
                    title={t("duplicateRole")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/settings/team/roles/${role.id}`)}
                    title={t("editRole")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(role.id)}
                    disabled={role.isSystem || role.userCount > 0}
                    title={
                      role.isSystem
                        ? t("cannotDeleteSystemRole")
                        : role.userCount > 0
                          ? t("cannotDeleteRoleWithUsers")
                          : t("deleteRole")
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteId && !!roleToDelete && !roleToDelete.isSystem}
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
