"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { uploadFileApi } from "@/lib/api/upload";

export function LogoUploadCard() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(tc("error"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("logoRequirements"));
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadFileApi(file, "logos");
      await updateSettings.mutateAsync({ logoUrl: url });
      toast.success(tc("updateSuccess"));
    } catch {
      toast.error(tc("error"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    updateSettings.mutate(
      { logoUrl: "" },
      {
        onSuccess: () => toast.success(tc("updateSuccess")),
        onError: () => toast.error(tc("error")),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const logoUrl = settings?.logoUrl;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-1">{t("businessLogo")}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t("logoDescription")}</p>

      <div className="flex items-center gap-4">
        {/* Logo Preview */}
        <div className="flex-shrink-0 w-24 h-24 rounded-lg border border-border bg-secondary/30 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 me-2" />
            {uploading ? tc("loading") : t("uploadLogo")}
          </Button>

          {logoUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={updateSettings.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t("removeLogo")}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">{t("logoRequirements")}</p>
        </div>
      </div>
    </div>
  );
}
