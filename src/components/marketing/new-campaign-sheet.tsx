"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marketingChannels } from "@/lib/mock-data";

interface NewCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCampaignSheet({ open, onOpenChange }: NewCampaignSheetProps) {
  const t = useTranslations("marketing");

  const [form, setForm] = useState({
    name: "",
    channel: "",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
  });

  const handleSubmit = () => {
    console.log("New campaign:", form);
    setForm({ name: "", channel: "", startDate: "", endDate: "", budget: "", description: "" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newCampaign")}</SheetTitle>
          <SheetDescription className="sr-only">{t("newCampaign")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("campaignName")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("channel")}</label>
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectChannel")} />
              </SelectTrigger>
              <SelectContent>
                {marketingChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>{channel}</SelectItem>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("budget")}</label>
            <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="font-english" dir="ltr" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("description")}</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
