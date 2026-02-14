"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportTypes } from "@/lib/mock-data";

interface NewReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewReportSheet({ open, onOpenChange }: NewReportSheetProps) {
  const t = useTranslations("reports");

  const [form, setForm] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    console.log("New report:", form);
    setForm({ type: "", startDate: "", endDate: "" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newReport")}</SheetTitle>
          <SheetDescription className="sr-only">{t("newReport")}</SheetDescription>
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
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("startDate")}</label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="font-english" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("endDate")}</label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="font-english" />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("generate")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
