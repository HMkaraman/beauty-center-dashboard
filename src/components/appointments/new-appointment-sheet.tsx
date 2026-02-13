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
import { servicesList, employeesList } from "@/lib/mock-data";

interface NewAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAppointmentSheet({ open, onOpenChange }: NewAppointmentSheetProps) {
  const t = useTranslations("appointments");

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    employee: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleSubmit = () => {
    console.log("New appointment:", form);
    setForm({
      clientName: "",
      clientPhone: "",
      service: "",
      employee: "",
      date: "",
      time: "",
      notes: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newAppointment")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("newAppointment")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientName")}</label>
            <Input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientPhone")}</label>
            <Input
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("service")}</label>
            <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectService")} />
              </SelectTrigger>
              <SelectContent>
                {servicesList.map((service) => (
                  <SelectItem key={service.name} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("employee")}</label>
            <Select value={form.employee} onValueChange={(v) => setForm({ ...form, employee: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employeesList.map((emp) => (
                  <SelectItem key={emp.id} value={emp.name}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("date")}</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("time")}</label>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("notesPlaceholder")}
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
