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
import { doctorSpecialties } from "@/lib/mock-data";

interface NewDoctorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewDoctorSheet({ open, onOpenChange }: NewDoctorSheetProps) {
  const t = useTranslations("doctors");

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    licenseNumber: "",
  });

  const handleSubmit = () => {
    console.log("New doctor:", form);
    setForm({
      name: "",
      specialty: "",
      phone: "",
      email: "",
      licenseNumber: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newDoctor")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("newDoctor")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("doctorName")}</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("specialty")}</label>
            <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectSpecialty")} />
              </SelectTrigger>
              <SelectContent>
                {doctorSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("phone")}</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("email")}</label>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("licenseNumber")}</label>
            <Input
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              className="font-english"
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
