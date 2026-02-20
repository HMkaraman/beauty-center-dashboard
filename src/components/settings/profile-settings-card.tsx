"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";

export function ProfileSettingsCard() {
  const t = useTranslations("settings.profile");
  const tc = useTranslations("common");
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    name: "",
    email: "",
    image: "" as string | null,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        image: profile.image || null,
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      { name: form.name, email: form.email, image: form.image },
      {
        onSuccess: () => toast.success(t("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  const initials = form.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-6">{t("title")}</h2>

      <div className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            {form.image ? (
              <AvatarImage src={form.image} alt={form.name} />
            ) : null}
            <AvatarFallback className="bg-gold/15 text-lg text-gold">
              {initials || <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{form.name || t("name")}</p>
            <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("name")}</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("email")}</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        {/* Role (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("role")}</label>
          <Input value={profile?.role || ""} disabled className="capitalize" />
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending || !form.name.trim()}
        >
          {updateProfile.isPending ? tc("save") + "..." : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
