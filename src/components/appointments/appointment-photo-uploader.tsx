"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadFileApi } from "@/lib/api/upload";
import { useAddAppointmentAttachment, useDeleteAppointmentAttachment, useAppointmentAttachments } from "@/lib/hooks/use-appointments";
import type { AppointmentAttachment } from "@/types";

const LABELS = ["before", "after", "during", "general"] as const;
const LABEL_KEYS: Record<string, string> = {
  before: "labelBefore",
  after: "labelAfter",
  during: "labelDuring",
  general: "labelGeneral",
};

interface AppointmentPhotoUploaderProps {
  appointmentId: string;
}

export function AppointmentPhotoUploader({ appointmentId }: AppointmentPhotoUploaderProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: attachments = [] } = useAppointmentAttachments(appointmentId);
  const addAttachment = useAddAppointmentAttachment();
  const deleteAttachment = useDeleteAppointmentAttachment();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFileApi(file, "appointments");
        await addAttachment.mutateAsync({
          id: appointmentId,
          data: {
            url: result.url,
            filename: result.filename,
            mimeType: result.mimeType,
            label: "general",
          },
        });
      }
      toast.success(tc("addSuccess"));
    } catch {
      toast.error(tc("errorOccurred"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (attachmentId: string) => {
    deleteAttachment.mutate(
      { id: appointmentId, attachmentId },
      { onSuccess: () => toast.success(tc("deleteSuccess")) }
    );
  };

  const handleLabelChange = (attachment: AppointmentAttachment, label: string) => {
    // Re-add with new label (simple approach — could add a PATCH endpoint later)
    addAttachment.mutate({
      id: appointmentId,
      data: {
        url: attachment.url,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        label,
        caption: attachment.caption,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">{t("uploadPhotos")}</p>
        {uploading && <p className="mt-1 text-xs text-muted-foreground">...</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Photo grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {attachments.map((att) => (
            <div key={att.id} className="group relative rounded-lg border border-border overflow-hidden">
              <div className="aspect-square bg-muted">
                {att.mimeType?.startsWith("image/") ? (
                  <img src={att.url} alt={att.caption || att.filename || ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1.5">
                <Select
                  value={att.label || "general"}
                  onValueChange={(v) => handleLabelChange(att, v)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {t(LABEL_KEYS[l] as "labelBefore")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => handleDelete(att.id)}
                className="absolute top-1 end-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
