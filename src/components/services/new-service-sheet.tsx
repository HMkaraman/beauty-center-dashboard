"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { serviceCategories } from "@/lib/mock-data";

interface NewServiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewServiceSheet({ open, onOpenChange }: NewServiceSheetProps) {
  const t = useTranslations("services");

  const [form, setForm] = useState({
    name: "",
    category: "",
    duration: "",
    price: "",
    description: "",
  });

  const handleSubmit = () => {
    console.log("New service:", form);
    setForm({
      name: "",
      category: "",
      duration: "",
      price: "",
      description: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newService")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("newService")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("name")}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("category")}</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("duration")}</label>
            <Input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("price")}</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="font-english"
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
