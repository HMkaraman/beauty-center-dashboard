"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Send, Paperclip, X, Loader2, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import { useCreateActivityNote } from "@/lib/hooks/use-activity-logs";
import type { ActivityEntityType } from "@/types";

interface NoteComposerProps {
  entityType: ActivityEntityType;
  entityId: string;
}

interface PendingAttachment {
  url: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
}

export function NoteComposer({ entityType, entityId }: NoteComposerProps) {
  const t = useTranslations("activityLog");
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUpload();
  const createNote = useCreateActivityNote();

  const handleSubmit = () => {
    if (!content.trim()) return;

    createNote.mutate(
      {
        entityType,
        entityId,
        content: content.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: () => {
          setContent("");
          setAttachments([]);
          setExpanded(false);
        },
      }
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload(file, "activity-attachments");
      setAttachments((prev) => [
        ...prev,
        {
          url: result.url,
          filename: result.filename,
          mimeType: result.mimeType,
          fileSize: file.size,
        },
      ]);
    } catch {
      // Error handled by useUpload hook
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border border-border bg-card p-3 text-start text-sm text-muted-foreground transition-colors hover:bg-secondary/30"
      >
        {t("notePlaceholder")}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("notePlaceholder")}
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        autoFocus
      />

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative">
              {att.mimeType?.startsWith("image/") ? (
                <img
                  src={att.url}
                  alt={att.filename}
                  className="h-16 w-16 rounded-md object-cover border border-border"
                />
              ) : att.mimeType?.startsWith("video/") ? (
                <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-2 flex items-center justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(false);
              setContent("");
              setAttachments([]);
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || createNote.isPending}
          >
            {createNote.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
