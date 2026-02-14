"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

const users = [
  { id: "1", name: "أحمد المدير", email: "admin@beautycenter.sa", role: "admin" },
  { id: "2", name: "سارة المشرفة", email: "sara@beautycenter.sa", role: "manager" },
  { id: "3", name: "نورة الموظفة", email: "noura@beautycenter.sa", role: "staff" },
  { id: "4", name: "هند المحاسبة", email: "hind@beautycenter.sa", role: "viewer" },
];

const roleStyles: Record<string, string> = {
  admin: "border-red-500/30 bg-red-500/10 text-red-400",
  manager: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  staff: "border-green-500/30 bg-green-500/10 text-green-400",
  viewer: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
};

export function UsersPermissionsCard() {
  const t = useTranslations("settings");

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">{t("usersPermissions")}</h3>
        <Button size="sm" variant="outline">
          <DynamicIcon name="UserPlus" className="h-4 w-4" />
          {t("inviteUser")}
        </Button>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs font-english text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant="outline" className={roleStyles[user.role]}>
              {t(`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as "roleAdmin" | "roleManager" | "roleStaff" | "roleViewer")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
