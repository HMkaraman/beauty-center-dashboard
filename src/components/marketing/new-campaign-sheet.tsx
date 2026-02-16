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
import { marketingChannels } from "@/lib/mock-data";
import { useCreateCampaign, useUpdateCampaign } from "@/lib/hooks/use-marketing";
import { Campaign } from "@/types";

interface NewCampaignSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Campaign | null;
}

const emptyForm = {
  name: "",
  channel: "",
  startDate: "",
  endDate: "",
  budget: "",
  description: "",
};

export function NewCampaignSheet({ open, onOpenChange, editItem }: NewCampaignSheetProps) {
  const t = useTranslations("marketing");
  const tc = useTranslations("common");
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        channel: editItem.channel,
        startDate: editItem.startDate,
        endDate: editItem.endDate,
        budget: String(editItem.budget),
        description: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.name) {
      toast.error(tc("requiredField"));
      return;
    }

    if (editItem) {
      updateCampaign.mutate({ id: editItem.id, data: {
        name: form.name,
        channel: form.channel,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget) || editItem.budget,
      } }, {
        onSuccess: () => {
          toast.success(tc("updateSuccess"));
          setForm(emptyForm);
          onOpenChange(false);
        },
      });
    } else {
      createCampaign.mutate({
        name: form.name,
        channel: form.channel,
        status: "draft",
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget) || 0,
        reach: 0,
        conversions: 0,
      }, {
        onSuccess: () => {
          toast.success(tc("addSuccess"));
          setForm(emptyForm);
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newCampaign")}</SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? tc("editItem") : t("newCampaign")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("campaignName")}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("budget")}</label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("description")}</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
