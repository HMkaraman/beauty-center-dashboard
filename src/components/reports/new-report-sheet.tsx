"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportTypes } from "@/lib/mock-data";
import { useCreateReport } from "@/lib/hooks/use-reports";
import { Report } from "@/types";

interface NewReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Report | null;
}

const emptyForm = {
  type: "",
  name: "",
  description: "",
  startDate: "",
  endDate: "",
};

export function NewReportSheet({ open, onOpenChange, editItem }: NewReportSheetProps) {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const createReport = useCreateReport();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        type: editItem.type,
        name: editItem.name,
        description: editItem.description,
        startDate: editItem.lastGenerated,
        endDate: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.type || !form.startDate) {
      toast.error(tc("requiredField"));
      return;
    }

    createReport.mutate(
      {
        type: form.type as Report["type"],
        name: form.name,
        description: form.description,
        lastGenerated: form.startDate,
        downloads: 0,
        fileSize: "0 MB",
      },
      {
        onSuccess: () => {
          toast.success(tc("addSuccess"));
          setForm(emptyForm);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newReport")}</SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? tc("editItem") : t("newReport")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("selectType")}</label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectType")} />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("reportName")}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("description")}</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("startDate")}</label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("endDate")}</label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="font-english"
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("generate")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
