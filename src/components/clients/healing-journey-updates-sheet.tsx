"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  ImagePlus, X, Stethoscope, FileText, StickyNote, Camera, Trophy, Plus, Trash2, Play,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HealingJourneyStatusBadge } from "./client-healing-journeys-table";
import { useJourneyEntries, useCreateJourneyEntry, useDeleteJourneyEntry } from "@/lib/hooks/use-healing-journeys";
import { useUpload } from "@/hooks/use-upload";
import type { HealingJourney, JourneyEntry, JourneyEntryType, AttachmentLabel, JourneyAttachment } from "@/types";
import { Price } from "@/components/ui/price";

interface HealingJourneyTimelineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  journey: HealingJourney | null;
}

const entryTypeConfig: Record<JourneyEntryType, { icon: typeof Stethoscope; color: string }> = {
  session: { icon: Stethoscope, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  prescription: { icon: FileText, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  note: { icon: StickyNote, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400" },
  photo: { icon: Camera, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" },
  milestone: { icon: Trophy, color: "text-gold bg-gold/15" },
};

function EntryCard({ entry, onDelete, locale }: { entry: JourneyEntry; onDelete: () => void; locale: string }) {
  const t = useTranslations("clients");
  const config = entryTypeConfig[entry.type];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-4 relative group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <Badge variant="outline" className="text-xs">{t(`entryType_${entry.type}`)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-english text-muted-foreground">{entry.date}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Session-specific content */}
      {entry.type === "session" && (
        <div className="space-y-1 text-sm">
          {entry.serviceName && (
            <p className="font-medium text-foreground">{entry.serviceName}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
            {entry.doctorName && <span>{t("entryDoctor")}: {entry.doctorName}</span>}
            {entry.employeeName && <span>{t("entryEmployee")}: {entry.employeeName}</span>}
            {entry.duration && <span>{entry.duration} {t("minutes")}</span>}
            {entry.price != null && entry.price > 0 && (
              <span className="font-english"><Price value={entry.price} /></span>
            )}
          </div>
        </div>
      )}

      {/* Prescription-specific content */}
      {entry.type === "prescription" && (
        <div className="space-y-1 text-sm">
          {entry.prescribedByDoctorName && (
            <p className="text-xs text-muted-foreground">{t("entryPrescribedBy")}: {entry.prescribedByDoctorName}</p>
          )}
          {entry.prescriptionText && (
            <p className="text-foreground whitespace-pre-wrap mt-1">{entry.prescriptionText}</p>
          )}
        </div>
      )}

      {/* Milestone-specific content */}
      {entry.type === "milestone" && entry.milestoneLabel && (
        <p className="text-sm font-medium text-foreground">{entry.milestoneLabel}</p>
      )}

      {/* Notes (shared across types) */}
      {entry.notes && (
        <p className="text-sm text-foreground whitespace-pre-wrap mt-2">{entry.notes}</p>
      )}

      {/* Attachments */}
      {entry.attachments && entry.attachments.length > 0 && (
        <AttachmentsDisplay attachments={entry.attachments} t={t} />
      )}
    </div>
  );
}

function AttachmentsDisplay({ attachments, t }: { attachments: JourneyAttachment[]; t: ReturnType<typeof useTranslations> }) {
  const beforePhotos = attachments.filter((a) => a.label === "before" && a.mimeType?.startsWith("image/"));
  const afterPhotos = attachments.filter((a) => a.label === "after" && a.mimeType?.startsWith("image/"));
  const hasSideBySide = beforePhotos.length > 0 && afterPhotos.length > 0;

  return (
    <div className="mt-3 space-y-2">
      {/* Before/After side-by-side comparison */}
      {hasSideBySide && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t("attachmentBefore")}</p>
            <div className="flex flex-wrap gap-1">
              {beforePhotos.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Before"}
                    className="h-20 w-20 rounded-md object-cover border border-border hover:opacity-80 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t("attachmentAfter")}</p>
            <div className="flex flex-wrap gap-1">
              {afterPhotos.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.url}
                    alt={photo.caption || "After"}
                    className="h-20 w-20 rounded-md object-cover border border-border hover:opacity-80 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Remaining attachments (non-before/after or videos) */}
      <div className="flex flex-wrap gap-2">
        {attachments
          .filter((a) => {
            if (hasSideBySide && (a.label === "before" || a.label === "after") && a.mimeType?.startsWith("image/")) {
              return false;
            }
            return true;
          })
          .map((att) => (
            <div key={att.id} className="relative">
              {att.mimeType?.startsWith("video/") ? (
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="block relative">
                  <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                </a>
              ) : att.mimeType?.startsWith("image/") ? (
                <a href={att.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={att.url}
                    alt={att.caption || att.filename || "Attachment"}
                    className="h-16 w-16 rounded-md object-cover border border-border hover:opacity-80 transition-opacity"
                  />
                </a>
              ) : (
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border hover:opacity-80 transition-opacity">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                </a>
              )}
              {att.label && att.label !== "general" && (
                <span className="absolute -top-1 -end-1 text-[10px] bg-secondary rounded px-1 border border-border">
                  {t(`attachmentLabel_${att.label}`)}
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export function HealingJourneyUpdatesSheet({ open, onOpenChange, clientId, journey }: HealingJourneyTimelineSheetProps) {
  const t = useTranslations("clients");
  const locale = useLocale();
  const { data: entries, isLoading } = useJourneyEntries(clientId, journey?.id ?? "");
  const createEntry = useCreateJourneyEntry();
  const deleteEntry = useDeleteJourneyEntry();
  const { upload, isUploading } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entryType, setEntryType] = useState<JourneyEntryType>("note");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Session fields
  const [serviceName, setServiceName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  // Prescription fields
  const [prescriptionText, setPrescriptionText] = useState("");
  const [prescribedByDoctorName, setPrescribedByDoctorName] = useState("");

  // Milestone fields
  const [milestoneLabel, setMilestoneLabel] = useState("");

  // Attachments
  const [pendingAttachments, setPendingAttachments] = useState<{
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    label: AttachmentLabel;
  }[]>([]);
  const [attachmentLabel, setAttachmentLabel] = useState<AttachmentLabel>("general");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const result = await upload(file, "healing-journeys");
        setPendingAttachments((prev) => [
          ...prev,
          {
            url: result.url,
            filename: file.name,
            mimeType: result.mimeType,
            fileSize: file.size,
            label: attachmentLabel,
          },
        ]);
      } catch {
        toast.error(t("uploadError"));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEntryType("note");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setServiceName("");
    setDoctorName("");
    setEmployeeName("");
    setPrice("");
    setDuration("");
    setPrescriptionText("");
    setPrescribedByDoctorName("");
    setMilestoneLabel("");
    setPendingAttachments([]);
    setAttachmentLabel("general");
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!date || !journey) {
      toast.error(t("dateRequired"));
      return;
    }

    const baseData = {
      type: entryType,
      date,
      notes: notes || undefined,
      attachments: pendingAttachments.map((a) => ({
        url: a.url,
        filename: a.filename,
        mimeType: a.mimeType,
        fileSize: a.fileSize,
        label: a.label,
      })),
    };

    let data: Record<string, unknown> = baseData;

    if (entryType === "session") {
      data = {
        ...baseData,
        serviceName: serviceName || undefined,
        doctorName: doctorName || undefined,
        employeeName: employeeName || undefined,
        price: price ? Number(price) : undefined,
        duration: duration ? Number(duration) : undefined,
      };
    } else if (entryType === "prescription") {
      data = {
        ...baseData,
        prescriptionText: prescriptionText || undefined,
        prescribedByDoctorName: prescribedByDoctorName || undefined,
      };
    } else if (entryType === "milestone") {
      data = {
        ...baseData,
        milestoneLabel: milestoneLabel || undefined,
      };
    }

    createEntry.mutate(
      { clientId, journeyId: journey.id, data },
      {
        onSuccess: () => {
          toast.success(t("entryAdded"));
          resetForm();
        },
      }
    );
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!journey) return;
    deleteEntry.mutate(
      { clientId, journeyId: journey.id, entryId },
      { onSuccess: () => toast.success(t("entryDeleted")) }
    );
  };

  if (!journey) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {journey.title}
            <HealingJourneyStatusBadge status={journey.status} />
          </SheetTitle>
          <SheetDescription className="sr-only">{t("viewEntries")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 px-4">
          {/* Timeline of entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                {t("entries")} ({entries?.length ?? 0})
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addEntry")}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border bg-secondary/20 p-4 h-24" />
                ))}
              </div>
            ) : entries && entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    locale={locale}
                    onDelete={() => handleDeleteEntry(entry.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                {t("noEntries")}
              </div>
            )}
          </div>

          {/* Add Entry form */}
          {showForm && (
            <div className="space-y-4 rounded-lg border border-border bg-secondary/10 p-4">
              <h3 className="text-sm font-medium text-foreground">{t("addEntry")}</h3>

              {/* Entry type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("entryTypeLabel")}</label>
                <Select value={entryType} onValueChange={(v) => setEntryType(v as JourneyEntryType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">{t("entryType_session")}</SelectItem>
                    <SelectItem value="prescription">{t("entryType_prescription")}</SelectItem>
                    <SelectItem value="note">{t("entryType_note")}</SelectItem>
                    <SelectItem value="photo">{t("entryType_photo")}</SelectItem>
                    <SelectItem value="milestone">{t("entryType_milestone")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("date")}</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-english" dir="ltr" />
              </div>

              {/* Session-specific fields */}
              {entryType === "session" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("entryServiceName")}</label>
                    <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("entryDoctor")}</label>
                      <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("entryEmployee")}</label>
                      <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("price")}</label>
                      <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="font-english" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("entryDuration")}</label>
                      <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="font-english" dir="ltr" />
                    </div>
                  </div>
                </>
              )}

              {/* Prescription-specific fields */}
              {entryType === "prescription" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("entryPrescribedBy")}</label>
                    <Input value={prescribedByDoctorName} onChange={(e) => setPrescribedByDoctorName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{t("entryPrescriptionText")}</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Milestone-specific fields */}
              {entryType === "milestone" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t("entryMilestoneLabel")}</label>
                  <Input value={milestoneLabel} onChange={(e) => setMilestoneLabel(e.target.value)} />
                </div>
              )}

              {/* Notes (all types) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("updateNotes")}</label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("uploadAttachments")}</label>
                <div className="flex items-center gap-2">
                  <Select value={attachmentLabel} onValueChange={(v) => setAttachmentLabel(v as AttachmentLabel)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t("attachmentGeneral")}</SelectItem>
                      <SelectItem value="before">{t("attachmentBefore")}</SelectItem>
                      <SelectItem value="after">{t("attachmentAfter")}</SelectItem>
                      <SelectItem value="during">{t("attachmentDuring")}</SelectItem>
                      <SelectItem value="prescription_scan">{t("attachmentPrescriptionScan")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {isUploading ? "..." : t("uploadAttachments")}
                  </Button>
                </div>
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingAttachments.map((att, i) => (
                      <div key={i} className="relative">
                        {att.mimeType.startsWith("image/") ? (
                          <img
                            src={att.url}
                            alt={att.filename}
                            className="h-16 w-16 rounded-md object-cover border border-border"
                          />
                        ) : att.mimeType.startsWith("video/") ? (
                          <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border">
                            <Play className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center border border-border">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 inset-x-0 text-center text-[9px] bg-secondary/80 rounded px-0.5 truncate">
                          {t(`attachmentLabel_${att.label}`)}
                        </span>
                        <button
                          type="button"
                          className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                          onClick={() => removeAttachment(i)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createEntry.isPending} className="flex-1">
                  {t("addEntry")}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  {t("close")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
