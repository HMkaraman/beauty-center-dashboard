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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSection, useUpdateSection } from "@/lib/hooks/use-sections";
import { Section } from "@/types";

interface NewSectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Section | null;
}

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16",
  "#22C55E", "#06B6D4", "#3B82F6", "#8B5CF6",
  "#EC4899", "#6B7280",
];

const emptyForm: {
  name: string;
  nameEn: string;
  description: string;
  color: string;
  status: "active" | "inactive";
} = {
  name: "",
  nameEn: "",
  description: "",
  color: "#3B82F6",
  status: "active",
};

export function NewSectionSheet({ open, onOpenChange, editItem }: NewSectionSheetProps) {
  const t = useTranslations("sections");
  const tc = useTranslations("common");
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        nameEn: editItem.nameEn || "",
        description: editItem.description || "",
        color: editItem.color || "#3B82F6",
        status: editItem.status,
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

    const payload = {
      name: form.name,
      nameEn: form.nameEn || undefined,
      description: form.description || undefined,
      color: form.color,
      status: form.status,
    };

    if (editItem) {
      updateSection.mutate(
        { id: editItem.id, data: payload },
        {
          onSuccess: () => {
            toast.success(tc("updateSuccess"));
            setForm(emptyForm);
            onOpenChange(false);
          },
        }
      );
    } else {
      createSection.mutate(payload, {
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
          <SheetTitle>
            {editItem ? tc("editItem") : t("newSection")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? tc("editItem") : t("newSection")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("nameAr")}
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("nameEn")}
            </label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("description")}
            </label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("color")}
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    form.color === color
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setForm({ ...form, color })}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("status")}
            </label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as "active" | "inactive" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
              </SelectContent>
            </Select>
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
